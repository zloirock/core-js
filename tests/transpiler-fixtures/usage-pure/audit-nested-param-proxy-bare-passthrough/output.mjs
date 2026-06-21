import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _self from "@core-js/pure/actual/self";
// the always-present passthrough off a PROXY receiver anchors on the receiver's pure import only when it has
// one: `globalThis`/`self` are polyfilled (`_self.Math.floor`), but `window`/`global` are NOT polyfilled in
// pure and must stay BARE (`window.Array.isArray`) - a missing pure entry falls back to the receiver's own
// name, never an empty base. babel delegates this to its visitor; the unplugin renders the same resolution.
// each line pairs a polyfillable leaf (arming the mirror) with an always-present passthrough off the proxy
function selfProxy({
  Array: {
    of
  },
  Math: {
    floor
  }
} = {
  Array: {
    of: _Array$of
  },
  Math: {
    floor: _self.Math.floor
  }
}) {
  return [of, floor];
}
function windowProxy({
  Object: {
    fromEntries
  },
  Array: {
    isArray
  }
} = {
  Object: {
    fromEntries: _Object$fromEntries
  },
  Array: {
    isArray: window.Array.isArray
  }
}) {
  return [fromEntries, isArray];
}
export { selfProxy, windowProxy };