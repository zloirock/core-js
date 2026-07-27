import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.entries";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/web.dom-collections.iterator";
// the write POSITIONS a patch can hide in, at the pipeline level: the model is per-FILE, so a write
// the analysis cannot order against the use - a compound / logical-assign operator, a dead branch, a
// loop body, a nested block - taints the namespace for the whole file, and the receiver whose type
// depends on it keeps the typeless row. each row patches a DIFFERENT namespace so the rows stay
// attributable, and the control patches nothing of the namespace it reads. distinct method per line
Object.create ||= replacement;
var fromLogicalPatch = Object.create(Array.prototype);
export const a = fromLogicalPatch.at(0);
if (0) {
  Array.from = replacement;
}
export const b = Array.from([1]).includes(2);
for (var i = 0; i < 1; i++) {
  Map.groupBy = replacement;
}
export const c = Map.groupBy([1], f).flatMap(g);
var pristine = {
  __proto__: Array.prototype
};
export const d = pristine.entries();