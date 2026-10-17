import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
import _self from "@core-js/pure/actual/self";
// the probe rides the fallback-LOGICAL and per-branch TERNARY synth spellings through the
// branch the value reads through (the left / the taken branch); a probe-carried key SE
// leaves the rescue channel exactly once
let c5 = 0;
export function viaSealedLogicalSynth({
  fromEntries: sl1
} = ((null == _globalThis.window ? void 0 : (c5++, _self)).Object, {
  fromEntries: _Object$fromEntries
})) {
  return sl1;
}
export { c5 };