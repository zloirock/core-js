// Returning a nested assignment preserves the realm and supplies its callable static.
let withResolvers;
function capture() {
  return ({ Promise: { withResolvers } } = globalThis);
}
use(capture(), withResolvers);
