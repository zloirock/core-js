import _globalThis from "@core-js/pure/actual/global-this";
// bodyless-if host blockifies and the effect stays CONDITIONAL (runs only with the branch)
let ok;
if (cond) {
  eff();
  ({
    isSecureContext: ok
  } = _globalThis);
}
export const r = [ok];