local UserClass = {}
UserClass.__index = UserClass

function UserClass.new(testVar)
	-- @param testVar string
	local self = {}
	return setmetatable(self, UserClass)
end

function UserClass:Method()
end

function UserClass:MethodWithArg(argName)
end

function UserClass:MethodReturningString()
	return "hi there";
end

function UserClass:MethodReturningConditional()
	return 10 > 20
end

function UserClass.staticFunction()
end

return UserClass