// a program-level `var` binds afresh in the sloppy host too - it is a CommonJS wrapper, whose top
// level is a function body - so every read of a name the file DECLARES is the user's own binding
// whatever the position: before the declarator's assignment, after it, in a statement HEAD, inside a
// function, and with no init at all. one global per position so a resurrected injection shows in the
// import set, and the last row is the CONTROL - a name the file never declares, which still injects.
// what a shadow leaves behind is decided by its own VALUE, not by the read: a flat `var Object = 1`
// is a number and leaves nothing, while the loop-HEAD read is shadowed by a write in the loop BODY
// that re-runs, so the receiver's value is unknown there and `.values` falls back to the instance
// family - the only injection any shadowed row here accounts for
var beforeAssign = Reflect.ownKeys({ a: 1 });
var Reflect = 1;
var afterAssign = Reflect;
var headRead = Object.entries({ b: 2 });
for (var i = Object.values({ c: 3 }); false;) { var Object = 1; }
var Number = 1;
var shadowedRead = Number.isFinite(0);
function insideFunction() { return Promise.allSettled([]); }
var Promise = 1;
var noInitRead = Set;
var Set;
var control = Array.from([1]);
