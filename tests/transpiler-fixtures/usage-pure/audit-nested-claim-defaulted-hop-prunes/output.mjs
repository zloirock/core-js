import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
var _ref, _ref3;
// a hop the dispatch EMPTIED prunes out of the residual even where it carried a slot DEFAULT: the
// fold already spelled both arms, so a prop kept for its default's sake would read the hop a SECOND
// time - the getter here fires once natively - and evaluate that default beside the guard owning it
const box = {
  get inner() {
    return [1, [2]];
  },
  keep: 2
};
const _ref2 = box;
const flat = _flatMaybeArray((_ref = _ref2.inner) === void 0 ? [] : _ref);
const {
  keep
} = _ref2; // ... and the same one level deeper, where the emptied hop's own host is a hop: the cascade takes
// both, and what is left binds only the sibling that named its own key
const deep = {
  outer: {
    inner: [3, [4]]
  },
  other: 5
};
const _ref4 = deep;
const flatMap = _flatMapMaybeArray((_ref3 = _ref4.outer.inner) === void 0 ? [] : _ref3);
const {
  other
} = _ref4;
export { flat, keep, flatMap, other };