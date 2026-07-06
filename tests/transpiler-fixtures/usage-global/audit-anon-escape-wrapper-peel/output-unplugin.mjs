import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.includes";
// paren / TS-cast wrappers between slot-read steps are runtime-transparent: a held read of the
// anon's own slot must escape through `(o.a as any).b` and `(o.a).b` exactly like the bare chain
// (babel strips the paren at parse, oxc keeps ParenthesizedExpression - the verdicts must not
// split between the pipelines), and a cast between a member and its call must not hide the
// method-call exposure. a slot read that is only DEREFERENCED through a cast keeps the narrow
function take(sink) {
  const castStep = { a: { b: { data: ['x'], read() { return this.data.at(0); } } } };
  sink((castStep.a as any).b);
  const parenStep = { a: { b: { tags: 'xy', scan() { return this.tags.includes('x'); } } } };
  sink((parenStep.a).b);
  const castCall = { w: { nums: [1], pick() { return this.nums.at(1); } }, grab() { return this.w; } };
  sink((castCall.grab as any)());
}
take(x => x);
// dereference through a cast keeps the narrow
const derefCast = { a: { list: [2], has() { return this.list.includes(2); } } };
(derefCast.a as any).has();
// a field write through a cast slot read still breaks the narrow premise
const castWritten = { a: { cells: ['w'], peek() { return this.cells.at(3); } } };
(castWritten.a as any).cells = 5;
castWritten.a.peek();