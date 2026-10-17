import _WeakMap from "@core-js/pure/actual/weak-map";
const {
  w: {
    WeakMap: hopThroughGetter
  }
} = {
  get w() {
    return {
      WeakMap: _WeakMap
    };
  }
};
export default [hopThroughGetter];