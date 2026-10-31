import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const iter = _getIteratorMethod(a);
const {
  includes,
  ...rest
} = b;