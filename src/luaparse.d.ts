interface LuaNode<T extends string = string> {
	type: T;
}

interface LuaStringLiteral extends LuaNode<"StringLiteral"> {
	value: string;
	raw: string;
}

interface LuaNumericLiteral extends LuaNode<"NumericLiteral"> {
	value: number;
	raw: string;
}

interface LuaBooleanLiteral extends LuaNode<"BooleanLiteral"> {
	value: boolean;
	raw: string;
}

interface LuaBinaryExpression extends LuaNode<"BinaryExpression"> {
	operator: string;
	left: LuaIdentifier;
	right: LuaIdentifier;
}

interface LuaReturnNode extends LuaNode<"ReturnStatement"> {
	arguments: LuaNode[];
}

interface LuaIdentifier extends LuaNode<"Identifier"> {
	name: string;
}

interface LuaMemberExpression extends LuaNode<"MemberExpression"> {
	indexer: ":" | ".";
	identifier: LuaIdentifier;
	base: LuaIdentifier;
}

interface LuaTableConstructorExpression
	extends LuaNode<"TableConstructorExpression"> {
	fields: LuaNode[];
}

interface LuaAssignmentStatement extends LuaNode<"AssignmentStatement"> {
	variables: LuaMemberExpression[];
	init: LuaNode[];
}

interface LuaTableKeyString extends LuaNode<"TableKeyString"> {
	key: LuaIdentifier;
	value: LuaNode;
}

interface LuaLocalStatement extends LuaNode<"LocalStatement"> {
	init: LuaNode[];
	variables: LuaIdentifier[];
}

interface LuaVarargLiteral extends LuaNode<"VarargLiteral"> {
	value: "...";
	raw: "...";
}

interface LuaFunctionDeclaration extends LuaNode<"FunctionDeclaration"> {
	identifier: LuaIdentifier;
	isLocal?: boolean;
	parameters: LuaNode[];
	body: LuaNode[];
}

interface LuaNodeRoot {
	type: string;
	body: LuaNode[];
}

declare module "luaparse" {
	interface Parser {
		parse(source: string, options: any): LuaNodeRoot;
	}
	const ParserImpl: Parser;
	export = ParserImpl;
}
