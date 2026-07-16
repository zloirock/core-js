import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A for-of head member write rebinds the slot each iteration - wrapped body reads and
// wrapped head targets alias that local write, not the prototype method: no method module
// may inject for them (parens survive the oxc parse, TS casts survive both parsers).
const a = [1, 2];
for (a.at of fns) {
  a.at(0);
}
const b: number[] = [3, 4];
for ((b as any).includes of fns) {
  b.includes(1);
}
// optional body read of the written slot - same alias, no injection
const e = [7, 8];
for (e.values of fns) {
  e?.values();
}
// control: a different receiver's same-named method still injects
const c = [[5]];
const d = [[6]];
for (c.flat of fns) {
  d.flat();
}