import luaparse from "luaparse";
import fs from "fs-extra";
import {
	Project,
	StructureKind,
	StatementStructures,
	VariableDeclarationKind,
	ExportSpecifierStructure,
	ParameterDeclarationStructure,
	PropertySignatureStructure,
	MethodSignatureStructure,
	MethodDeclarationStructure,
	ConstructSignatureDeclaration,
	ConstructorDeclarationStructure,
} from "ts-morph";
import TypeGuard, {
	isLuaIdentifier,
	isTableConstructorExpression,
	isLuaAssignmentStatement,
	isLuaReturnNode,
	isLuaStringLiteral,
	isLuaNumericLiteral,
	isLuaBooleanLiteral,
	isLuaBinaryExpression,
} from "./util/guards";
import path from "path";
import { typeOf } from "./util/helper";

const interfaces = new Map<
	string,
	{
		methods: MethodSignatureStructure[];
		properties: PropertySignatureStructure[];
	}
>();

const classes = new Map<
	string,
	{
		ctors: ConstructorDeclarationStructure[];
		methods: MethodDeclarationStructure[];
		properties: PropertySignatureStructure[];
	}
>();

function getFunctionParameters(functonNode: LuaFunctionDeclaration) {
	const parameters = new Array<ParameterDeclarationStructure>();
	for (const param of functonNode.parameters) {
		if (TypeGuard.isLuaIdentifier(param)) {
			parameters.push({
				kind: StructureKind.Parameter,
				type: "unknown",
				name: param.name,
			});
		} else if (TypeGuard.isLuaVarargLiteral(param)) {
			parameters.push({
				kind: StructureKind.Parameter,
				isRestParameter: true,
				name: "arg",
				type: "unknown[]",
			});
		}
	}
	return parameters;
}

function getValueTypeOfNode(node: LuaNode) {
	if (isLuaStringLiteral(node)) {
		return "string";
	} else if (isLuaNumericLiteral(node)) {
		return "number";
	} else if (isLuaBooleanLiteral(node) || isLuaBinaryExpression(node)) {
		return "boolean";
	} else {
		return "unknown";
	}
}

function getReturnType(returnNode: LuaReturnNode) {
	const returnTypes = [];
	for (const node of returnNode.arguments) {
		returnTypes.push(getValueTypeOfNode(node));
	}

	return returnTypes.length > 1
		? `LuaTuple<[${returnTypes.join(", ")}]>`
		: returnTypes[0] || "void";
}

function getFunctionReturnType(functionNode: LuaFunctionDeclaration) {
	let returnType = "void";
	for (const bodyNode of functionNode.body) {
		if (isLuaReturnNode(bodyNode)) {
			returnType = getReturnType(bodyNode);
			break;
		}
	}
	return returnType;
}

function getInterfacedNodes(body: LuaNode[]) {
	for (const bodyNode of body) {
		if (TypeGuard.isLuaFunctionDeclaration(bodyNode)) {
			const { identifier } = bodyNode;
			console.log("bodyDecl", bodyNode);
			if (TypeGuard.isMemberExpression(identifier)) {
				const int = interfaces.get(identifier.base.name);
				const cls = classes.get(identifier.base.name);
				if (int) {
					if (identifier.indexer === ":") {
						console.log("add method");
						int.methods.push({
							kind: StructureKind.MethodSignature,
							name: identifier.identifier.name,
							returnType: "void",
						});
					} else {
						int.properties.push({
							kind: StructureKind.PropertySignature,
							name: identifier.identifier.name,
							type: "(...args: unknown[]) => unknown",
							trailingTrivia:
								" /* Dot function cannot be inferred */",
						});
					}
				} else if (cls) {
					if (identifier.indexer === ":") {
						console.log("add method");
						cls.methods.push({
							kind: StructureKind.Method,
							name: identifier.identifier.name,
							parameters: getFunctionParameters(bodyNode),
							returnType: getFunctionReturnType(bodyNode),
						});
					} else {
						if (identifier.identifier.name === "new") {
							console.log("add constructor");
							cls.ctors.push({
								kind: StructureKind.Constructor,
								parameters: getFunctionParameters(bodyNode),
							});
						} else {
							cls.methods.push({
								kind: StructureKind.Method,
								name: identifier.identifier.name,
								isStatic: true,
								parameters: getFunctionParameters(bodyNode),
								returnType: getFunctionReturnType(bodyNode),
							});
						}
					}
				}
			}
		}
	}
}

function getNodesMatchingName(name: string, body: LuaNode[]) {
	const statements = new Array<StatementStructures>();
	for (const bodyNode of body) {
		if (TypeGuard.isLuaFunctionDeclaration(bodyNode)) {
			if (bodyNode.identifier.name === name) {
				const parameters = getFunctionParameters(bodyNode);

				let returned = false;
				for (const functionBodyNode of bodyNode.body) {
					if (TypeGuard.isLuaReturnNode(functionBodyNode)) {
						const returns = [];

						for (const returnedValue of functionBodyNode.arguments) {
							if (TypeGuard.isLuaStringLiteral(returnedValue)) {
								returns.push("string");
							} else if (
								TypeGuard.isLuaNumericLiteral(returnedValue)
							) {
								returns.push("number");
							}
						}

						returned = true;
						statements.push({
							hasDeclareKeyword: true,
							kind: StructureKind.Function,
							name,
							returnType:
								returns.length > 1
									? `LuaTuple<[${returns.join(", ")}]>`
									: returns[0] || "unknown",
							parameters,
						});
					}
				}

				if (!returned) {
					statements.push({
						hasDeclareKeyword: true,
						kind: StructureKind.Function,
						name,
						returnType: "void",
						parameters,
					});
				}
			} else if (TypeGuard.isLuaLocalStatement(bodyNode)) {
				for (const vars of bodyNode.variables) {
					if (vars.name === name) {
						statements.push({
							kind: StructureKind.VariableStatement,
							hasDeclareKeyword: true,
							declarationKind: VariableDeclarationKind.Const,
							declarations: [
								{
									name: vars.name,
									type: interfaces.has(vars.name)
										? vars.name
										: "unknown",
								},
							],
						});
					}
				}
			}
		}
	}
	return statements;
}

function generateStatementsForReturn(node: LuaReturnNode, body: LuaNode[]) {
	const statements = new Array<StatementStructures>();
	const { arguments: nodeArgs } = node;

	for (const arg of nodeArgs) {
		if (isLuaIdentifier(arg)) {
			statements.push(...getNodesMatchingName(arg.name, body));

			statements.push({
				kind: StructureKind.ExportAssignment,
				expression: arg.name,
			});
		} else if (isTableConstructorExpression(arg)) {
			const namedExports = new Array<ExportSpecifierStructure>();

			for (const field of arg.fields) {
				if (TypeGuard.isLuaTableKeyString(field)) {
					const { key, value } = field;

					if (TypeGuard.isLuaIdentifier(value)) {
						statements.push(
							...getNodesMatchingName(value.name, body),
						);

						if (value.name === key.name) {
							namedExports.push({
								kind: StructureKind.ExportSpecifier,
								name: key.name,
							});
						} else {
							namedExports.push({
								kind: StructureKind.ExportSpecifier,
								name: value.name,
								alias: key.name,
							});
						}
					}
				}
			}

			statements.push({
				kind: StructureKind.ExportDeclaration,
				namedExports,
			});
		} else {
			console.log(`unknown expression ${node.type}`);
		}
	}

	return statements;
}

function generate(body: LuaNode[]) {
	const statements = new Array<StatementStructures>();

	for (const node of body) {
		// Handle top-level return node (export)
		if (TypeGuard.isLuaReturnNode(node)) {
			for (const [name, interfaceDeclaration] of interfaces.entries()) {
				statements.push({
					kind: StructureKind.Interface,
					name: name,
					hasDeclareKeyword: true,
					properties: interfaceDeclaration.properties,
					methods: interfaceDeclaration.methods,
				});

				statements.push({
					kind: StructureKind.VariableStatement,
					hasDeclareKeyword: true,
					declarationKind: VariableDeclarationKind.Const,
					declarations: [
						{
							name: name,
							type: name,
						},
					],
				});
			}

			for (const [name, interfaceDeclaration] of classes.entries()) {
				console.log("declare class", name);

				statements.push({
					kind: StructureKind.Class,
					name: name,
					hasDeclareKeyword: true,
					ctors: interfaceDeclaration.ctors,
					trailingTrivia: " /* Found __index usage - Class */",
					methods: interfaceDeclaration.methods,
				});
			}

			getInterfacedNodes(body);

			statements.push(...generateStatementsForReturn(node, body));
		} else if (isLuaAssignmentStatement(node)) {
			console.log("isLuaAssignmentStatement");
			for (const [index, variable] of node.variables.entries()) {
				const init = node.init[index] as LuaIdentifier;

				// Convert to class...
				console.log("luaMemExpression", variable, init);
				if (
					init.name === variable.base.name &&
					variable.identifier.name === "__index"
				) {
					const existing = interfaces.get(init.name);
					if (existing) {
						classes.set(init.name, {
							properties: [],
							ctors: [],
							methods: existing.methods.map(method => {
								console.log(method.name, "existingMethod");
								return {
									kind: StructureKind.Method,
									returnType: method.returnType,
									name: method.name,
									parameters: method.parameters,
								} as MethodDeclarationStructure;
							}),
						});

						interfaces.delete(init.name);
					}
				}
			}
		} else if (TypeGuard.isLuaLocalStatement(node)) {
			for (const [i, v] of node.variables.entries()) {
				const init = node.init[i];
				if (TypeGuard.isTableConstructorExpression(init)) {
					const properties = new Array<PropertySignatureStructure>();
					for (const field of init.fields) {
						if (TypeGuard.isLuaTableKeyString(field)) {
							properties.push({
								kind: StructureKind.PropertySignature,
								name: field.key.name,
								type: TypeGuard.isLiteral(field.value)
									? typeOf(field.value)
									: "unknown",
							});
						}
					}

					interfaces.set(v.name, {
						properties,
						methods: [],
					});
				}
			}
		} else if (TypeGuard.isLuaDoStatement(node)) {
			statements.push(...generate(node.body));
			getInterfacedNodes(node.body);
		}
	}

	return statements;
}

function generateFileFor(file: string) {
	fs.readFile(file)
		.then(buffer => {
			return buffer.toString();
		})
		.then(contents => {
			return luaparse.parse(contents, {});
		})
		.then(ast => {
			console.log(JSON.stringify(ast, null, 4));

			const statements = generate(ast.body);

			const project = new Project({
				compilerOptions: {
					declaration: true,
				},
			});

			const newFile = path.join(
				path.dirname(file),
				path.basename(file, ".lua") + ".d.ts",
			);

			project.createSourceFile(
				newFile,
				{
					statements,
					leadingTrivia:
						"/* Generated with Experimental RbxLua -> Declaration program */",
				},
				{ overwrite: true },
			);

			project.save();
		});
}

generateFileFor("testing/input.lua");
