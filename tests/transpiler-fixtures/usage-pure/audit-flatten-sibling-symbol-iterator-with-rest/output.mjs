import _globalThis from "@core-js/pure/actual/global-this";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const obj = _globalThis;
const {
  Array: {
    from
  },
  [_Symbol$iterator]: iter,
  ...rest
} = obj;
console.log(from, iter, rest);