import _filterMaybeArray from "@core-js/pure/actual/array/instance/filter";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
// A relocated catch default and a nested read keep their own bindings.
// The temporary default guard belongs to the joined extraction declaration.
try {
  throw getPlugin();
} catch (_ref) {
  let _ref2,
    name = (_ref2 = _nameMaybeFunction(_ref)) === void 0 ? 'anonymous' : _ref2;
  let filter = _filterMaybeArray(_ref.options);
  use(name, filter);
}