namespace TypeGuard {
	export function isLuaReturnNode(node: LuaNode): node is LuaReturnNode {
		return node.type === "ReturnStatement";
	}

	export function isLuaNumericLiteral(
		node: LuaNode,
	): node is LuaNumericLiteral {
		return node.type === "NumericLiteral";
	}

	export function isLuaStringLiteral(
		node: LuaNode,
	): node is LuaStringLiteral {
		return node.type === "StringLiteral";
	}

	export function isLiteral(
		node: LuaNode,
	): node is LuaStringLiteral | LuaNumericLiteral {
		return isLuaStringLiteral(node) || isLuaNumericLiteral(node);
	}

	export function isLuaIdentifier(node: LuaNode): node is LuaIdentifier {
		return node.type === "Identifier";
	}

	export function isLuaLocalStatement(
		node: LuaNode,
	): node is LuaLocalStatement {
		return node.type === "LocalStatement";
	}

	export function isTableConstructorExpression(
		node: LuaNode,
	): node is LuaTableConstructorExpression {
		return node.type === "TableConstructorExpression";
	}

	export function isMemberExpression(
		node: LuaNode,
	): node is LuaMemberExpression {
		return node.type === "MemberExpression";
	}

	export function isLuaFunctionDeclaration(
		node: LuaNode,
	): node is LuaFunctionDeclaration {
		return node.type === "FunctionDeclaration";
	}

	export function isLuaTableKeyString(
		node: LuaNode,
	): node is LuaTableKeyString {
		return node.type === "TableKeyString";
	}

	export function isLuaVarargLiteral(
		node: LuaNode,
	): node is LuaVarargLiteral {
		return node.type === "VarargLiteral";
	}

	export function isLuaAssignmentStatement(
		node: LuaNode,
	): node is LuaAssignmentStatement {
		return node.type === "AssignmentStatement";
	}

	export function isLuaMemberExpression(
		node: LuaNode,
	): node is LuaMemberExpression {
		return node.type === "MemberExpression";
	}

	export function isLuaBooleanLiteral(
		node: LuaNode,
	): node is LuaBooleanLiteral {
		return node.type === "BooleanLiteral";
	}

	export function isLuaBinaryExpression(
		node: LuaNode,
	): node is LuaBinaryExpression {
		return node.type === "BinaryExpression";
	}
}

export = TypeGuard;
