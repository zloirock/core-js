// A call through a name bound twice in one scope reaches no single local function: the constructor it hands
// over may land in whatever else the name holds, and its statics are injected. A binding a call cannot reach -
// none, or a primitive - is no second one, and the constructor handed past it stays narrow.
let viaCall = make();
if (c) viaCall = function (handed) {};
viaCall(Map);
let viaInitless;
viaInitless = function (handed) {};
viaInitless(Promise);
let viaPrimitive = function (handed) {};
if (c) viaPrimitive = 0;
viaPrimitive(Iterator);
