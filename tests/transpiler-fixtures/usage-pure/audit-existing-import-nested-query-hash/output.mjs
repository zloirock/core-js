// combined query `?import&v=abc` + hash `#foo` - Vite/Rolldown dev-server ids use both
// at once; `stripQueryHash` must cut at the FIRST of `?`/`#` to find the entry prefix
import _Foo from '@core-js/pure/actual/array/from?import&v=abc#foo';
const x = _Foo([1, 2]);
console.log(_Foo);