import _globalThis from "@core-js/pure/actual/global-this";
// negative: a ternary-branch effect keeps the nested handling (branch may not be taken)
const {
  Iterator: {
    customC
  }
} = cond ? (eff(), _globalThis) : _globalThis;
export const r = [customC];