// a hop the dispatch EMPTIED prunes out of the residual even where it carried a slot DEFAULT: the
// fold already spelled both arms, so a prop kept for its default's sake would read the hop a SECOND
// time - the getter here fires once natively - and evaluate that default beside the guard owning it
const box = {
  get inner() { return [1, [2]]; },
  keep: 2,
};
const { inner: { flat } = [], keep } = box;
// ... and the same one level deeper, where the emptied hop's own host is a hop: the cascade takes
// both, and what is left binds only the sibling that named its own key
const deep = { outer: { inner: [3, [4]] }, other: 5 };
const { outer: { inner: { flatMap } = [] }, other } = deep;
export { flat, keep, flatMap, other };
