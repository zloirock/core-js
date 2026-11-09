import _Set from "@core-js/pure/actual/set/constructor";
// The pattern anchors on a pure constructor even when its realm root is native.
const {
  prototype: {
    union
  }
} = _Set;
export { union };