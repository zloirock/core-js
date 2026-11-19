// existing polyfill import with combined query `?import&v=abc` + hash `#foo`
// (Vite / Rolldown dev-server ids use both at once) must still be recognised
// as a polyfill for `Array.from`, so the reference reuses the existing binding
import _Foo from '@core-js/pure/actual/array/from?import&v=abc#foo';
const x = Array.from([1, 2]);
console.log(_Foo);
