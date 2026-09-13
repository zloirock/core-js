import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol from "@core-js/pure/actual/symbol";
// Object-rest keeps the affected assignment pattern native and preserves its RHS value.
// Independent reads and key/default expressions still receive their own polyfills.
let a, b;
a = _Array$from;
({
  deep: {
    other: b
  }
} = _globalThis.Array);
use(a, b);
let s, f, x;
s = _Symbol;
({
  deep: {
    x
  }
} = _globalThis);
f = _Array$from;
use(s, f, x);
let g;
({
  of: g,
  ...rest
} = _globalThis.Array);
use(g, rest);
let inner;
({
  fromEntries,
  ...inner
} = _globalThis.Object);
use(fromEntries, inner);