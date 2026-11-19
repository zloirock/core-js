import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
// The method, receiver check, fallback and source effects keep their original evaluation slots.
let r;
const effects = [];
const {
  resolve
} = (null == _globalThis.window ? void 0 : {
  resolve: _Promise$resolve
}) ?? {
  resolve: "fallback"
};
r = typeof resolve;