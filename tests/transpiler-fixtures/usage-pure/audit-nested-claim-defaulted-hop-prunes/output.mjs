import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
var _ref, _ref2;
// a hop the dispatch EMPTIED prunes out of the residual even where it carried a slot DEFAULT: the
// fold already spelled both arms, so a prop kept for its default's sake would read the hop a SECOND
// time - the getter here fires once natively - and evaluate that default beside the guard owning it
const box = {
  get inner() {
    return [1, [2]];
  },
  keep: 2
};
const flat = _flatMaybeArray((_ref = box.inner) === void 0 ? [] : _ref);
const {
  keep
} = box;
// ... and the same one level deeper, where the emptied hop's own host is a hop: the cascade takes
// both, and what is left binds only the sibling that named its own key
const deep = {
  outer: {
    inner: [3, [4]]
  },
  other: 5
};
const flatMap = _flatMapMaybeArray((_ref2 = deep.outer.inner) === void 0 ? [] : _ref2);
const {
  other
} = deep;
export { flat, keep, flatMap, other };