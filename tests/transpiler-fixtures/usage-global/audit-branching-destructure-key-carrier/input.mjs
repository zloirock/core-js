// a BRANCHING computed destructure key (`{ [cond ? "from" : "of"]: v }`) resolves to no single
// dominating key, yet each literal arm is reachable at runtime - usage-global must inject each arm
// keyed to the resolved destructure RECEIVER, exactly like the member-access union `Array[cond ?
// "from" : "of"]`. the receiver was previously dropped to typeless for the two hosts whose init is
// not a plain declarator/assignment read: the array-wrappered element (paired to the array slot)
// and the plain-IIFE caller-arg.
[{[flag ? "from" : "of"]: viaArrayWrap} = {}] = [Array];
(function ({[flag ? "assign" : "entries"]: viaIife}) {})(Object);
({[flag ? "fromEntries" : "values"]: viaAssign} = Object);
