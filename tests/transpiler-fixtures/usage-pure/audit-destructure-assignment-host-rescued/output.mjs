import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
// a chain-assignment as the host init of a nested destructure: same rescue contract through
// the Property-hop walk
let a;
const {
  Array: {
    from
  }
} = (a = _globalThis, {
  Array: {
    from: _Array$from
  }
});