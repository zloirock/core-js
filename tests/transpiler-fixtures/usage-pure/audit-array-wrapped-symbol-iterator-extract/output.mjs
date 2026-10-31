import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected method slots native; computed symbol keys still polyfill.
// Independent reads and key/default expressions still receive their own polyfills.
const [{
  [_Symbol$iterator]: it,
  ...r
}, tail] = [arr, 0];
it;
r;
tail;
const single = _getIteratorMethod(other);
single;