import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A head whose LEFT is a pattern unpacks the element it binds, and unpacking is a read: it re-homes what its own leaves bind,
// exactly as the declarator twin does.
const out = [];
// NEGATIVE: ... and that same write does reach the read once an OUTER loop RE-ENTERS the head,
// which evaluates the iterable again, against the slot the previous entry replaced
const reentered = {
  w: Array
};
for (let round = 0; round < 2; round += 1) {
  for (const {
    from
  } of [reentered.w]) {
    reentered.w = Map;
    out.push(typeof from);
  }
}
export { out };