import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
// catch-param destructure with a polyfillable non-iterator symbol key (Symbol.asyncIterator)
// carrying BOTH a default and a rest sibling: the default must survive into the rebuilt body
// pattern, else the local binds to undefined instead of the default when the key is absent
try {} catch (_ref) {
  let {
    [_Symbol$asyncIterator]: ait = fallback,
    ...rest
  } = _ref;
  ait;
  rest;
}