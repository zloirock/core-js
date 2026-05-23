// `new (() => {...})()` parses (Arrow inside parens is a CoverExpression so
// `new MemberExpression(...)` accepts it) but throws TypeError at runtime -
// arrows are non-constructible. The straight-line IIFE finder MUST reject
// NewExpression with arrow callee so writes from the never-executed body
// don't appear to narrow post-call usage
let x;
try { new (() => { x = "hi"; })(); } catch (e) {}
var first = x.at(0);
var contains = x.includes("h");
export { first, contains };
