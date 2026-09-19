// destructure receiver is a ternary / logical-or: each viable branch becomes its own
// `{key: _Branch$key}` literal independently; non-viable branches (unknown identifiers
// or no matching static method) are left raw
//
// declaration init: ternary, both viable
const { from: a1 } = cond ? Array : Map;
// declaration init: ||, mixed viable (Array.from yes, userObj unknown)
const { from: a2 } = userObj || Array;
// declaration init: ??, member-call left (not identifier - left stays raw)
const { from: a3 } = pickConstructor() ?? Array;
// assignment expression: ternary, multi-key destructure
let b1, b2;
({ from: b1, of: b2 } = cond ? Array : Map);
// default-value param (function param default): && reversed
function f({ groupBy } = Promise && Map) { return groupBy; }
// default-value param: nested conditional - outer ?? wraps inner ?
function g({ try: t } = (cond1 ? Promise : null) ?? Promise) { return t; }
export { a1, a2, a3, b1, b2, f, g };
