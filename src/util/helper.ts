export function typeOf({
	value,
}: LuaNumericLiteral | LuaStringLiteral): string {
	if (typeof value === "string") {
		return "string";
	} else if (typeof value === "number") {
		return "number";
	}
	return "unknown";
}
