import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise/constructor";
// A call through a name bound twice in one scope reaches no single local function: the constructor it hands
// over may land in whatever else the name holds, so its entry carries the statics. A binding a call cannot
// reach - none, or a primitive - is no second one, and the constructor handed past it takes the narrow entry.
let viaCall = make();
if (c) viaCall = function (handed) {};
viaCall(_Map);
let viaInitless;
viaInitless = function (handed) {};
viaInitless(_Promise);
let viaPrimitive = function (handed) {};
if (c) viaPrimitive = 0;
viaPrimitive(_Iterator);