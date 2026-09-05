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
const r = { w: Object, y: [1] };
const other = {};
function eff() { return 0; }
function f() {}
const shim = 0;
const out = [];
const viaConst = r.w;
const viaConstValues = viaConst.values;
var _r$w = r.w, viaLowered = _r$w.values;
var _r = r, viaLoweredRoot = _r.w.values;
var _ref = [eff(), r], _ref$ = _ref[1], _ref$$w = _ref$.w, viaLoweredWrapper = _ref$$w.values;
const chainA = r.w;
const chainB = chainA;
const viaChain = chainB.values;
const seqAlias = (eff(), r.w);
const viaSeqAlias = seqAlias.entries;
const seqRoot = (eff(), r);
const viaSeqRoot = seqRoot.w.keys;
let installed;
const chainInstall = (eff(), installed = r.w);
const viaChainInstall = chainInstall.is;
const { values: viaDestructure } = viaConst;
const viaCall = viaConst.values({});
const box = [r];
const viaWrapperIndex = box[0].w.values;
const indexAlias = box[0];
const viaIndexAlias = indexAlias.w.values;
const deep = { k: [r] };
const viaNestedWrapper = deep.k[0].w.values;
const instanceAlias = r.y;
const viaInstanceAlias = instanceAlias.at;
out.push(viaConstValues, viaLowered, viaLoweredRoot, viaLoweredWrapper, viaChain, viaSeqAlias, viaSeqRoot,
  viaChainInstall, viaDestructure, viaCall, viaWrapperIndex, viaIndexAlias, viaNestedWrapper, viaInstanceAlias);
{
  const written = { w: Object };
  const writtenAlias = written.w;
  written.w = Array;
  const viaWrittenSlot = writtenAlias.values;
  out.push(viaWrittenSlot);
}
{
  const seqWritten = { w: Object };
  const seqWriter = (seqWritten.w = Array, seqWritten);
  const viaSeqWriter = seqWriter.w.assign;
  out.push(viaSeqWriter);
}
{
  const source = { w: Object };
  let reassigned = source.w;
  reassigned = Array;
  const viaReassigned = reassigned.values;
  out.push(viaReassigned);
}
{
  const source = { w: Object };
  const handed = source.w;
  f(handed);
  const viaHanded = handed.values;
  out.push(viaHanded);
}
{
  const source = { w: Object };
  const handedWrapper = [source];
  f(handedWrapper);
  const viaHandedWrapper = handedWrapper[0].w.values;
  out.push(viaHandedWrapper);
}
{
  const source = { w: Object };
  const patched = source.w;
  patched.getOwnPropertySymbols = shim;
  const viaPatched = patched.getOwnPropertySymbols;
  out.push(viaPatched);
}
{
  const source = { w: Object };
  const wrapperWritten = { k: source };
  wrapperWritten.k.w = Map;
  const { w: { values: viaWrapperWritten } } = source;
  out.push(viaWrapperWritten);
}
export { out, other };
