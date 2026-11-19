import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// The of static has no import supplied by loop syntax; this isolates the pattern claim.
for (const {
  Array: {
    of
  },
  JSON: J
} of [{
  Array: {
    of: _Array$of
  },
  JSON: _globalThis.JSON
}, {
  Array: {
    of: _Array$of
  },
  JSON: _self.JSON
}]) of([J]);