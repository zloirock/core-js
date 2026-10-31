import _globalThis from "@core-js/pure/actual/global-this";
// a mutated global SLOT declines the registration (the alias holds the user's replacement);
// a mutated STATIC keeps the member read native the same way
_globalThis.JSON = fake;
function viaMutatedSlot(input) {
  const {
    JSON: J
  } = _globalThis;
  outerUse(J.stringify(input));
  return function inner() {
    var J;
    var {
      JSON: J
    } = _globalThis;
    return J.rawJSON(input);
  };
}
export const results = [viaMutatedSlot];