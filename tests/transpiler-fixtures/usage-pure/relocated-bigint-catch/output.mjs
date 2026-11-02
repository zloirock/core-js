import _at from "@core-js/pure/actual/instance/at";
// A BigInt default in a catch pattern remains intact beside an extracted instance method.
try {
  read();
} catch (_ref) {
  let at = _at(_ref);
  let {
    limit = 10n
  } = _ref;
  use(at, limit);
}