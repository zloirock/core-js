import _globalThis from "@core-js/pure/actual/global-this";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// BOTH branches chain-assign to the proxy: each write survives on its native path, sequenced ahead
// of a per-branch mirror that serves the static - both emitters agree
let c5 = Math.random() < 0.5;
let q5, w5;
const {
  Object: {
    fromEntries: objFromEntries
  }
} = c5 ? (q5 = _globalThis, {
  Object: {
    fromEntries: _Object$fromEntries
  }
}) : (w5 = _globalThis, {
  Object: {
    fromEntries: _Object$fromEntries
  }
});
export const viaDualChain = objFromEntries([["k", 1]]);