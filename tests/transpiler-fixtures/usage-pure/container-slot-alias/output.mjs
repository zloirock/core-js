import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
import _Map from "@core-js/pure/actual/map";
import _Object$entries from "@core-js/pure/actual/object/entries";
import _Object$is from "@core-js/pure/actual/object/is";
import _Object$keys from "@core-js/pure/actual/object/keys";
import _Object$values from "@core-js/pure/actual/object/values";
// a PLAIN ALIAS of a container slot (`const a = r.w`; `var _r$w = r.w`, the spelling a destructure
// lowering ahead of this plugin leaves) re-homes the slot's value under a name the census can still
// follow: writes and escapes spelled through the alias canonicalize onto the slot, so the alias's own
// declaration escapes nothing and a read through it descends the literal the direct spelling
// descends (`_Object$values`, never the instance dispatcher that answers `undefined` on IE11).
// a WRAPPER literal holding a container by name is followed the same way, through nested literals
// and array indices. the alias holds the VALUE its init spells - the tail behind an effect prefix,
// the value a chain assignment installs (`(eff(), r.w)`, `(installed = r.w)`) - since the prefix
// ran at the declaration; a prefix that WRITES the slot is a write the census records like any other.
// what still deopts: a slot written through the alias's container, a reassigned
// alias, an alias handed to a call, a wrapper handed to a call, a mutated static through the alias.
// the census is flow-insensitive per binding - an escape or a write anywhere reaches every read of
// that binding - so each deopting row owns a container of its own, declared in a block of its own:
// beside the positive rows it would deopt them all and lock the instance dispatcher as the answer
const r = {
  w: Object,
  y: [1]
};
const other = {};
function eff() {
  return 0;
}
function f() {}
const shim = 0;
const out = [];
const viaConst = r.w;
const viaConstValues = _Object$values;
var _r$w = r.w,
  viaLowered = _Object$values;
var _r = r,
  viaLoweredRoot = _Object$values;
var _ref = [eff(), r],
  _ref$ = _ref[1],
  _ref$$w = _ref$.w,
  viaLoweredWrapper = _Object$values;
const chainA = r.w;
const chainB = chainA;
const viaChain = _Object$values;
const seqAlias = (eff(), r.w);
const viaSeqAlias = _Object$entries;
const seqRoot = (eff(), r);
const viaSeqRoot = _Object$keys;
let installed;
const chainInstall = (eff(), installed = r.w);
const viaChainInstall = _Object$is;
const viaDestructure = _Object$values;
const viaCall = _Object$values({});
const box = [r];
const viaWrapperIndex = _Object$values;
const indexAlias = box[0];
const viaIndexAlias = _Object$values;
const deep = {
  k: [r]
};
const viaNestedWrapper = _Object$values;
const instanceAlias = r.y;
const viaInstanceAlias = _at(instanceAlias);
_pushMaybeArray(out).call(out, viaConstValues, viaLowered, viaLoweredRoot, viaLoweredWrapper, viaChain, viaSeqAlias, viaSeqRoot, viaChainInstall, viaDestructure, viaCall, viaWrapperIndex, viaIndexAlias, viaNestedWrapper, viaInstanceAlias);
{
  const written = {
    w: Object
  };
  const writtenAlias = written.w;
  written.w = Array;
  const viaWrittenSlot = _values(writtenAlias);
  _pushMaybeArray(out).call(out, viaWrittenSlot);
}
{
  const seqWritten = {
    w: Object
  };
  const seqWriter = (seqWritten.w = Array, seqWritten);
  const viaSeqWriter = seqWriter.w.assign;
  _pushMaybeArray(out).call(out, viaSeqWriter);
}
{
  const source = {
    w: Object
  };
  let reassigned = source.w;
  reassigned = Array;
  const viaReassigned = reassigned.values;
  _pushMaybeArray(out).call(out, viaReassigned);
}
{
  const source = {
    w: Object
  };
  const handed = source.w;
  f(handed);
  const viaHanded = _values(handed);
  _pushMaybeArray(out).call(out, viaHanded);
}
{
  const source = {
    w: Object
  };
  const handedWrapper = [source];
  f(handedWrapper);
  const viaHandedWrapper = _values(handedWrapper[0].w);
  _pushMaybeArray(out).call(out, viaHandedWrapper);
}
{
  const source = {
    w: Object
  };
  const patched = source.w;
  patched.getOwnPropertySymbols = shim;
  const viaPatched = patched.getOwnPropertySymbols;
  _pushMaybeArray(out).call(out, viaPatched);
}
{
  const source = {
    w: Object
  };
  const wrapperWritten = {
    k: source
  };
  wrapperWritten.k.w = _Map;
  const viaWrapperWritten = _values(source.w);
  _pushMaybeArray(out).call(out, viaWrapperWritten);
}
export { out, other };