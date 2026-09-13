import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected pattern native, including inside an array wrapper.
// Independent reads and key/default expressions still receive their own polyfills.
const [{
  'from': f,
  [_Symbol$iterator]: it,
  ...r
}] = [Array];
f([1]);
it;
r;