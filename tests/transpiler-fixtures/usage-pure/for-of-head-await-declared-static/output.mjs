import _Array$of from "@core-js/pure/actual/array/of";
// An awaited local head may hold Array, without handing its whole namespace out.
// The static read needs its own import; pure guards the uncertain receiver by identity.
async function use() {
  for await (const value of [Array]) (value === Array ? _Array$of : value.of.bind(value))(3);
}
use();