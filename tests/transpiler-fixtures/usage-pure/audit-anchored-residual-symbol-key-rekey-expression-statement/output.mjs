import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map from "@core-js/pure/actual/map/constructor";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// a computed `Symbol.X` key kept inside an ANCHORED residual re-keys to the polyfilled
// symbol binding (the whole-prop render must not leak raw `Symbol` text - a ReferenceError
// on symbol-less engines): a well-known name uses its dedicated entry, an unknown name
// polyfills the constructor read, and a scope-shadowed `Symbol` stays the user's own object
const _ref = {
  Map: _Map,
  Object: {
    fromEntries: _Object$fromEntries
  }
};
const a = _getIteratorMethod(_ref.Map);
const {
  Object: {
    fromEntries: fe
  }
} = _ref;
a;