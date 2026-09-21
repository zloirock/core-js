import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// A container slot holding a constructor member read resolves that constructor.
// The nested static receives its pure method through the intermediate slot.
const wrapper = {
  a: _globalThis.Array
};
const {
  a: {
    from
  }
} = {
  a: {
    from: _Array$from
  }
};
from([1, 2, 3]);