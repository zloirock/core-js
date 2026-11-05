import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// a preserved sibling holding an ArrayPattern-WRAPPED nested proxy destructure is flatten-eligible
// like the bare object form; the outer sibling-walk must skip its receiver, or a queued transform
// survives the inner flatten overwrite and crashes text composition
const {
    Array: {
      from
    }
  } = globalThis,
  val = function () {
    const [{
      Array: {
        of
      }
    }] = [globalThis];
    return of;
  }();
export { from, val };