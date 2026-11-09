import _Iterator from "@core-js/pure/actual/iterator/constructor";
// The native realm root does not own the nested constructor claim.
const {
  prototype: {
    flatMap
  }
} = _Iterator;
export { flatMap };