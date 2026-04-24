// pre-existing user import has a bundler query suffix (Vite/webpack cache-bust);
// the plugin should recognize it as the same core-js module and reuse the binding
// instead of emitting a duplicate import
import _Foo from '@core-js/pure/actual/array/from?v=123';
const x = Array.from([1, 2]);
console.log(_Foo);
