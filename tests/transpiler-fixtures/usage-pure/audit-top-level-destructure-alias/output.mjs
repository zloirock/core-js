import _globalThis from "@core-js/pure/actual/global-this";
import _Array$from from "@core-js/pure/actual/array/from";
// top-level alias: `{ Array } = globalThis`. resolveProxyGlobalDestructureAlias sees a proxy
// receiver and maps Array binding -> 'Array' global, then .from call routes to Array.from polyfill
const {
  Array: MyArr
} = _globalThis;
_Array$from([1, 2, 3]);