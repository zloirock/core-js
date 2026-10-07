import _includes from "@core-js/pure/actual/instance/includes";
import _Iterator$concat from "@core-js/pure/actual/iterator/concat";
import _Object$values from "@core-js/pure/actual/object/values";
// A capitalised user global on the left of `||` / `??` reads a key naming an instance method through the
// generic dispatch, unless the right's constructor owns the key as a static: that arm then takes the
// static's own entry, as the conditional spelling does. A key the right owns no static of keeps the dispatch.
const {
  concat
} = Stub || {
  concat: _Iterator$concat
};
const {
  values
} = Stub ?? {
  values: _Object$values
};
const includes = _includes(Stub ?? Object);
export { concat, values, includes };