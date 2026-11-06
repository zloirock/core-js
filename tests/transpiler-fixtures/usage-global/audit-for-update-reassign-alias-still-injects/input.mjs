// a global alias reassigned in a for-loop UPDATE clause runs AFTER the body each iteration, so the
// first iteration's body read precedes the write - it cannot dominate the use. usage-global must keep
// injecting the init global's static, not treat the textually-earlier-but-later-executing update as
// a dominating overwrite. distinct statics per loop so each injected polyfill is attributable.
var A = Array;
for (var i = 0; i < 1; A = 0) {
  A.from([1]);
}
var O = Object;
for (var j = 0; j < 1; O = 0) {
  O.fromEntries([['k', 1]]);
}
