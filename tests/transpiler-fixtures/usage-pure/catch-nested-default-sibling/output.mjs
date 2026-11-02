import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A nested default keeps its guard local to the relocated catch body.
// A sibling extraction must not discard that guard declaration.
try {
  throw getPlugin();
} catch (_ref) {
  var _ref2;
  let name = _nameMaybeFunction((_ref2 = _at(_ref)) === void 0 ? {
    name: 'fallback'
  } : _ref2);
  let includes = _includes(_ref.meta);
  use(name, includes);
}