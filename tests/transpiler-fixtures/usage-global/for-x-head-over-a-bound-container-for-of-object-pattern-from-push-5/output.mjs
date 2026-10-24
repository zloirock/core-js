import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A head whose LEFT is a pattern unpacks the element it binds, and unpacking is a read: it re-homes what its own leaves bind,
// exactly as the declarator twin does.
const out = [];
// NEGATIVE: the container's slot is read by a GETTER, so the read is the effect and no literal
// stands in for it; an effectful key is the same refusal spelled on the other side
const observed = {
  get w() {
    out.push('got');
    return Array;
  }
};
for (const {
  from
} of [observed.w]) out.push(typeof from);
export { out };