import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a for-of head's WRAPPED element types its slot through the wrapper level: a realm in the slot
// dispatches no instance key, so no typeless row is fabricated beside the head's own answer
function forOfWrappedRealm() {
  const out = [];
  for (const [{
    w: {
      toReversed: headAt
    }
  }] of [[{
    w: globalThis
  }]]) out.push(headAt);
  return out;
}
export default [forOfWrappedRealm()];