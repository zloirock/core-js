// Finite computed keys contribute every reachable static method in global output.
// Array-wrapper and inline-argument sources select their slots without releasing the whole family.
// Pure preserves these native patterns where no single key can be substituted.
[{[flag ? "from" : "of"]: viaArrayWrap} = {}] = [Array];
(function ({[flag ? "assign" : "entries"]: viaIife}) {})(Object);
({[flag ? "fromEntries" : "values"]: viaAssign} = Object);
