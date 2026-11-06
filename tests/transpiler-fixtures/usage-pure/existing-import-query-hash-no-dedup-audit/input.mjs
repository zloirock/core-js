// pre-existing user import has a bundler query suffix (a cache-bust query parameter);
// the import-source comparison should ignore the query suffix and recognize this as
// the same core-js module, reusing the existing binding rather than emitting a duplicate
import _Foo from '@core-js/pure/actual/array/from?v=123';
const x = Array.from([1, 2]);
console.log(_Foo);
