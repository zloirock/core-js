import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
try {} catch ({
  [_Symbol$asyncIterator]: ait = fallback,
  ...rest
}) {
  ait;
  rest;
}