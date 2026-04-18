// pre-existing user import has a query suffix (Vite/webpack-style cache-bust);
// `scanExistingCoreJSImports` must strip `?` / `#` before package-prefix matching
// so the existing binding is reused instead of a duplicate being emitted
import _Foo from '@core-js/pure/actual/array/from?v=123';
const x = Array.from([1, 2]);
console.log(_Foo);
