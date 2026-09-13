import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
export const {
  [_Symbol$iterator]: iter,
  includes,
  ...rest
} = obj;