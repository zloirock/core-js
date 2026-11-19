import _Array$of from "@core-js/pure/actual/array/of";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
// An awaited local head may hold Array - or another constructor core-js ships no replacement of (`Number`) -
// without handing its whole namespace out.
// The static read needs its own import; pure guards the uncertain receiver by identity.
async function use() {
  for await (const value of [Array]) (value === Array ? _Array$of : value.of.bind(value))(3);
  for await (const owner of [Number]) (owner === Number ? _Number$isInteger : owner.isInteger.bind(owner))(3);
}
use();