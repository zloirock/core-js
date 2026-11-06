import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// A prototype method in a loop initializer follows every nested sequence prefix.
// The prefixes run once before the instance dispatch reads the prototype.
// Global mode keeps the source pattern and supplies its imports.
for (const {
    prototype: _ref
  } = (outer(), inner(), Array), at = _atMaybeArray(_ref); flag;) {
  use(at);
}