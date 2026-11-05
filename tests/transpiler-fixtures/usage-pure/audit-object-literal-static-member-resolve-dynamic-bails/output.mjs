import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// An unknown computed key can replace a literal slot, so its statics dispatch on the stored constructor.
// The clean Iterator container retains the full constructor and native property read.
const clean = {
  S: _Iterator
};
const {
  S: {
    from
  }
} = clean;
export function dynamicBails(o) {
  const ns = {
    P: Array,
    [o.k]: _Iterator
  };
  const {
      P: _ref
    } = ns,
    from = _ref === _Iterator ? _Iterator$from : _ref === Array ? _Array$from : _ref.from;
  return from([1, 2]);
}