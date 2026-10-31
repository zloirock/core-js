// An awaited local head may hold Array - or another constructor core-js ships no replacement of (`Number`) -
// without handing its whole namespace out.
// The static read needs its own import; pure guards the uncertain receiver by identity.
async function use() {
  for await (const value of [Array]) value.of(3);
  for await (const owner of [Number]) owner.isInteger(3);
}
use();
