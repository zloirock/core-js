import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a nested-block `var` hoists to its function scope and SHADOWS an outer same-name binding for
// every use inside that function - the adapter's closest-binding resolution must prefer it over
// the outer binding the scope tracker reports (an outer alias fold verdict would otherwise leak
// in: a wrong symbol fold masks the native undefined read, a proxy-ctor alias fold masks the
// native TypeError on the unassigned path, a user shadow of a destructured ctor alias is ignored).
// an over-hoisted namespace-local class does not shadow, but the nested `var` under it still does.
var iterator = _Symbol$iterator;
export const top = _getIteratorMethod([]);
function viaSymbol() {
  {
    var iterator = {};
  }
  return [1][iterator];
}
export const s = viaSymbol();
var G = _globalThis;
export const outer = _Array$from([1]);
function viaCtor(flag) {
  if (flag) {
    var G = _globalThis;
  }
  return G.Array.from([2]);
}
export const c = [viaCtor(true)];
var M = _Map;
export const viaTop = _Map$groupBy(['a'], x => x);
function viaShadow() {
  {
    var M = {
      groupBy() {
        return 'user';
      }
    };
  }
  return M.groupBy(['b'], x => x);
}
export const u = viaShadow();
export { M };
namespace Outer {
  class WeakSet {}
}
function viaNamespace() {
  {
    var WeakSet = _WeakMap;
  }
  return new WeakSet();
}
export const n = viaNamespace();
// negatives: a declaration INSIDE the var's hoist owner keeps the native view - a same-name
// param, a nearer block `let`, a catch param; and a var inside an INNER function never leaks
// out to shadow the outer alias
export function viaParam(Promise) {
  {
    var Promise = {
      resolve: () => 'p'
    };
  }
  return Promise.resolve('x');
}
export function viaNearerLet() {
  {
    var Symbol = {
      iterator: 'v'
    };
  }
  {
    let Symbol = {
      iterator: 'l'
    };
    return [][Symbol.iterator];
  }
}
export function viaCatch() {
  try {
    throw 0;
  } catch (Iterator) {
    {
      var Iterator = {
        range: () => 'c'
      };
    }
    return Iterator.range(0, 1);
  }
}
var A = _globalThis;
function innerFn() {
  {
    var A = 1;
  }
  return A;
}
export const outerStays = _Array$of(1);
export const innerStays = innerFn();