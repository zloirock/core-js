import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// Global also needs Array.from for loop syntax; the separate of twin observes this claim.
// Each realm element supplies its own nested pattern on every iteration.
for (const {
  Array: {
    from
  },
  JSON: J
} of [{
  Array: {
    from: _Array$from
  },
  JSON: _globalThis.JSON
}, {
  Array: {
    from: _Array$from
  },
  JSON: _self.JSON
}]) from([J]);