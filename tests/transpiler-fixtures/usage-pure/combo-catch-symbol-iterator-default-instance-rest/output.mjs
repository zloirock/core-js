import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
try {} catch ({
  [_Symbol$iterator]: iter,
  includes = fb,
  ...rest
}) {
  iter();
  includes("x");
}