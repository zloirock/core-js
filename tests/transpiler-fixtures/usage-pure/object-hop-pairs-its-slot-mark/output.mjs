import _WeakSet from "@core-js/pure/actual/weak-set";
const {
  w: {
    WeakSet: keptByGetterEffect
  }
} = {
  get w() {
    mark();
    return {
      WeakSet: _WeakSet
    };
  }
};
function mark() {}
export default [keptByGetterEffect];