import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
try {
  risky();
} catch ({
  [_Symbol$iterator]: iter,
  ...rest
}) {
  use(iter, rest);
}