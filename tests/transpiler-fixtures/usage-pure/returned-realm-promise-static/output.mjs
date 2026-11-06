import _globalThis from "@core-js/pure/actual/global-this";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// Returning a nested assignment preserves the realm and supplies its callable static.
let withResolvers;
function capture() {
  return withResolvers = _Promise$withResolvers, _globalThis;
}
use(capture(), withResolvers);