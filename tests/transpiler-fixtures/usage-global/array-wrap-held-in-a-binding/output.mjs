import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An array literal held in a binding hands its element to a later destructure: the binding's own
// declaration keeps every effect of the literal, so the static extracts whatever trails the element,
// at any depth. An inline wrapper around such a binding keeps its own trailing effect in the native
// initializer, ahead of both iterations.
const seen = [];
const eff = t => (seen.push(t), t);
const wrap = [(eff('h'), globalThis), eff('i')];
const [{
  Reflect: {
    ownKeys
  }
}] = wrap;
const wrap2 = [[(eff('j'), globalThis), eff('k')]];
const [[{
  Object: {
    entries
  }
}]] = wrap2;
const w3 = [globalThis];
const [[{
  Object: {
    hasOwn
  }
}]] = [w3, eff('m')];
export { ownKeys, entries, hasOwn, seen };