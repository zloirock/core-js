import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.copy-within";
import "core-js/modules/es.array.fill";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an assignment-destructure with a memoized receiver in each unbraced control slot: the source is
// not rewritten here, so the import set is the whole observable - one method per slot keeps each
// slot's contribution distinct instead of letting a sibling mask a dropped one
const obj = {
  list: [1, 2]
};
let m1, m2, m3, m4, m5, m6;
if (c1()) ({
  at: m1
} = obj.list);
if (!c2()) ;else ({
  flat: m2
} = obj.list);
for (let i = 0; i < 1; i++) ({
  includes: m3
} = obj.list);
for (const x of [1]) ({
  findLast: m4
} = obj.list);
for (const k in {
  a: 1
}) ({
  copyWithin: m5
} = obj.list);
do ({
  fill: m6
} = obj.list); while (false);
console.log(m1, m2, m3, m4, m5, m6);