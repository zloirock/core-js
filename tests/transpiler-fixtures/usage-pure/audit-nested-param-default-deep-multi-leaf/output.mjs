import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
// a DEEP proxy hop (`self`) with MULTIPLE leaves: the synthesized default mirrors the whole
// single-chain path and carries every leaf (`self` is a global-proxy hop, normalized per the
// established proxy-global contract - the literal supplies the path even where a target lacks
// the alias). distinct methods show both leaves resolved
function f({
  self: {
    Array: {
      from,
      of
    }
  }
} = {
  self: {
    Array: {
      from: _Array$from,
      of: _Array$of
    }
  }
}) {
  return [from([1]), of(2)];
}
f();