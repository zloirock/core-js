import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
// A retained unknown key must not turn a served constructor sibling into a native read.
// The remaining raw sibling reads the same receiver at its original position.
let key = 'Promise';
const {
  globalThis: {
    [key]: {
      prototype
    }
  },
  Map: M,
  missing
} = (key = 'Array', (_ref => {
  return {
    globalThis: _globalThis,
    Map: _Map,
    get missing() {
      return _ref.missing;
    }
  };
})(_globalThis));
new M();