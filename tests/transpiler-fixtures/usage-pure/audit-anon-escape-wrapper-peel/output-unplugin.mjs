import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// paren / TS-cast wrappers between slot-read steps are runtime-transparent: a held read of the
// anon's own slot must escape through `(o.a as any).b` and `(o.a).b` exactly like the bare chain
// (babel strips the paren at parse, oxc keeps ParenthesizedExpression - the verdicts must not
// split between the pipelines), and a cast between a member and its call must not hide the
// method-call exposure. a slot read that is only DEREFERENCED through a cast keeps the narrow
function take(sink) {
  const castStep = { a: { b: { data: ['x'], read() {
var _ref; return _at(_ref = this.data).call(_ref, 0); } } } };
  sink((castStep.a as any).b);
  const parenStep = { a: { b: { tags: 'xy', scan() {
var _ref2; return _includes(_ref2 = this.tags).call(_ref2, 'x'); } } } };
  sink((parenStep.a).b);
  const castCall = { w: { nums: [1], pick() {
var _ref3; return _at(_ref3 = this.nums).call(_ref3, 1); } }, grab() { return this.w; } };
  sink((castCall.grab as any)());
}
take(x => x);
// dereference through a cast keeps the narrow
const derefCast = { a: { list: [2], has() {
var _ref4; return _includesMaybeArray(_ref4 = this.list).call(_ref4, 2); } } };
(derefCast.a as any).has();
// a field write through a cast slot read still breaks the narrow premise
const castWritten = { a: { cells: ['w'], peek() {
var _ref5; return _at(_ref5 = this.cells).call(_ref5, 3); } } };
(castWritten.a as any).cells = 5;
castWritten.a.peek();