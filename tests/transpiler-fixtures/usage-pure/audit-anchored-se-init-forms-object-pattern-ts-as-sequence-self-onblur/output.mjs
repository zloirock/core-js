import _globalThis from "@core-js/pure/actual/global-this";
// transparent wrappers around the SE-init peel: a TS cast and oxc-kept parens both fold
const {
  onblur: tb
} = (eff(), _globalThis);
export const r = [tb];