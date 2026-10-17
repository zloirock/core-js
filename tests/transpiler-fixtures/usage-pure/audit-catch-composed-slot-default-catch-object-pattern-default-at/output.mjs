import _at from "@core-js/pure/actual/instance/at";
// the CATCH host is the same question one relocation further: the caught value has no type either,
// and its flat twin already dispatches generically
try {
  risky();
} catch (_ref) {
  let _ref2,
    caught = (_ref2 = _at(_ref)) === void 0 ? 1 : _ref2;
  use(caught);
}