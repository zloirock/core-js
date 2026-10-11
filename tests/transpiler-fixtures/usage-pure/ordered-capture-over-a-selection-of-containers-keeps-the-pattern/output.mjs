import _Array$from from "@core-js/pure/actual/array/from";
import _Iterator from "@core-js/pure/actual/iterator";
// a capture keeping a nested level's keys in their order names the constructor that level reads:
// over a selection of containers the arms hold different constructors, so the level stays as
// written. a single container still captures its static
let from, rest, single, others;
export const selected = () => ({
  C: {
    from,
    ...rest
  }
} = flag ? {
  C: Array
} : {
  C: _Iterator
});
export const contained = () => {
  var _ref2, _ref, _unused;
  return _ref = {
    C: _ref2
  } = {
    C: Array
  }, {} = _ref2, single = _Array$from, {
    from: _unused,
    ...others
  } = _ref2, _ref;
};