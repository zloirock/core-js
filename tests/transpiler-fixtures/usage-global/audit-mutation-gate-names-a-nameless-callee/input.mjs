// An inline function receives its argument directly; a tag puts its interpolation
// after the strings array. Both named writes must invalidate the later return type.
// Neither write releases the namespace. Distinct receivers keep both routes observable.
const o = {};
(function (ns) {
  ns.entries = patch;
})(Object);
Object.entries(o).forEach(noop);

function tag(strings, ns) {
  ns.ownKeys = patch;
}
tag`${ Reflect }`;
Reflect.ownKeys(o).map(noop);
