import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A write in the sequence prefix of a destructure init runs before the pattern binds anything.
// The rewrite consuming the whole pattern lifts that prefix ahead of the extraction, and every
// later read sees the write there: a constructor alias reads the written constructor's statics,
// a member read dispatches on the written value.
let Ctor = Array;
const {
  from
} = (Ctor = Map, Array);
export const ctorGroupBy = Ctor.groupBy;
const box = {
  items: [1, 2]
};
let of;
({
  of
} = (box.items = 'ab', Array));
export const last = box.items.at(-1);
export const made = [from([3]), of(4)];