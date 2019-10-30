import luaparse from "luaparse";

namespace TypeGuard {
	export function isLuaReturnNode(
		node: luaparse.Node,
	): node is luaparse.ReturnStatement {
		return node.type === "ReturnStatement";
	}

	export function isLuaNumericLiteral(
		node: luaparse.Node,
	): node is luaparse.NumericLiteral {
		return node.type === "NumericLiteral";
	}

	export function isLuaStringLiteral(
		node: luaparse.Node,
	): node is luaparse.StringLiteral {
		return node.type === "StringLiteral";
	}

	export function isLiteral(
		node: luaparse.Node,
	): node is luaparse.StringLiteral | luaparse.NumericLiteral {
		return isLuaStringLiteral(node) || isLuaNumericLiteral(node);
	}

	export function isLuaIdentifier(
		node: luaparse.Node,
	): node is luaparse.Identifier {
		return node.type === "Identifier";
	}

	export function isLuaLocalStatement(
		node: luaparse.Node,
	): node is luaparse.LocalStatement {
		return node.type === "LocalStatement";
	}

	export function isTableConstructorExpression(
		node: luaparse.Node,
	): node is luaparse.TableConstructorExpression {
		return node.type === "TableConstructorExpression";
	}

	export function isMemberExpression(
		node: luaparse.Node,
	): node is luaparse.MemberExpression {
		return node.type === "MemberExpression";
	}

	export function isLuaFunctionDeclaration(
		node: luaparse.Node,
	): node is luaparse.FunctionDeclaration {
		return node.type === "FunctionDeclaration";
	}

	export function isLuaTableKeyString(
		node: luaparse.Node,
	): node is luaparse.TableKeyString {
		return node.type === "TableKeyString";
	}

	export function isLuaVarargLiteral(
		node: luaparse.Node,
	): node is luaparse.VarargLiteral {
		return node.type === "VarargLiteral";
	}

	export function isLuaAssignmentStatement(
		node: luaparse.Node,
	): node is luaparse.AssignmentStatement {
		return node.type === "AssignmentStatement";
	}

	export function isLuaMemberExpression(
		node: luaparse.Node,
	): node is luaparse.MemberExpression {
		return node.type === "MemberExpression";
	}

	export function isLuaBooleanLiteral(
		node: luaparse.Node,
	): node is luaparse.BooleanLiteral {
		return node.type === "BooleanLiteral";
	}

	export function isLuaBinaryExpression(
		node: luaparse.Node,
	): node is luaparse.BinaryExpression {
		return node.type === "BinaryExpression";
	}

	export function isLuaDoStatement(
		node: luaparse.Node,
	): node is luaparse.DoStatement {
		return node.type === "DoStatement";
	}
}

export = TypeGuard;
