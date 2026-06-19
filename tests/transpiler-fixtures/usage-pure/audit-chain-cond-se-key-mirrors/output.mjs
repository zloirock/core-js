import _JSON$stringify from "@core-js/pure/actual/json/stringify";
// a SIDE-EFFECTING computed key whose receiver is a proxy-global CHAIN (`globalThis.self.JSON`),
// behind a diverging ternary. the chain resolves to the constructor exactly like a bare one, so the
// proxy branch mirrors to a synth literal under the resolved static key while the user branch stays
// native (no corruption). the effect stays in the residual LHS key and runs exactly once
const userObj = {};
const cond = false;
const {
  [(eff(), "stringify")]: stringify
} = cond ? {
  "stringify": _JSON$stringify
} : userObj;
typeof stringify;