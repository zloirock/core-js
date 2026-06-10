// a DEEP proxy hop (`self`) with MULTIPLE leaves: the synthesized default mirrors the whole
// single-chain path and carries every leaf (`self` is a global-proxy hop, normalized per the
// established proxy-global contract - the literal supplies the path even where a target lacks
// the alias). distinct methods show both leaves resolved
function f({ self: { Array: { from, of } } } = globalThis) {
  return [from([1]), of(2)];
}
f();
