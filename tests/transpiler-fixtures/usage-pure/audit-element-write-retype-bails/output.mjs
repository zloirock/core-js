import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _fillMaybeArray from "@core-js/pure/actual/array/instance/fill";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _spliceMaybeArray from "@core-js/pure/actual/array/instance/splice";
import _withMaybeArray from "@core-js/pure/actual/array/instance/with";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
import iterSym from "s";

// element-type precision holds only while nothing can retype the elements between the
// array's creation and the read: an element write flips the family at runtime, so the
// read bails to the generic helper instead of keying a wrong-family Maybe (ie:11)
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13, _ref14, _ref15, _ref16, _ref17, _ref18, _ref19, _ref20, _ref21;
const written = [1, 2];
written[0] = 'x';
export const viaElementWrite = _at(_ref = written[0]).call(_ref, 0);

// a read-only-referenced literal keeps its per-element precision
const sealed = [[1], [2]];
export const viaSealedRead = _includesMaybeArray(_ref2 = sealed[0]).call(_ref2, 1);

// a mutating method retypes elements the same way an element write does - which methods
// mutate is registry data, not local knowledge
const pushed = [[1], [2]];
_pushMaybeArray(pushed).call(pushed, [3]);
export const viaMutatorCall = _at(_ref3 = pushed[0]).call(_ref3, 0);

// a method the registry does not know may be any mutator at runtime, so it bails too
const custom = [[1], [2]];
custom.custom();
export const viaUnknownCall = _includes(_ref4 = custom[0]).call(_ref4, 3);

// a registry-known non-mutating method keeps the per-element precision
const scanned = [[1], [2]];
scanned.forEach(f);
export const viaSafeCall = _atMaybeArray(_ref5 = scanned[0]).call(_ref5, 1);

// an optional-chained mutator call bails the same way as the plain spelling
const filled = [[1], [2]];
filled == null ? void 0 : _fillMaybeArray(filled).call(filled, ["x"]);
export const viaOptionalMutator = _at(_ref6 = filled[0]).call(_ref6, 2);

// a registry METHOD read outside a call position extracts the function value - its later
// call is untrackable, so the extraction bails regardless of which method leaves
const extracted = [[1], [2]];
const m = _spliceMaybeArray(extracted);
export const viaMutatorExtraction = _includes(_ref7 = extracted[0]).call(_ref7, 5);
const lent = [[1], [2]];
use(_includesMaybeArray(lent));
export const viaSafeExtraction = _at(_ref8 = lent[0]).call(_ref8, -1);

// non-method member reads stay plain reads - element precision survives
const measured = [[1], [2]];
use(measured.length, measured.custom);
export const viaPropertyReads = _includesMaybeArray(_ref9 = measured[0]).call(_ref9, 7);

// an optional-chained SAFE method keeps the precision - the optional lowering must not
// degrade a registry-known non-mutating call into an unknown one
const opted = [[1], [2]];
opted == null ? void 0 : _includesMaybeArray(opted).call(opted, 9);
export const viaOptionalSafeCall = _atMaybeArray(_ref10 = opted[0]).call(_ref10, 3);

// a call through a DYNAMIC (symbol / unresolved) key may be any mutator - it bails
const keyed = [[1], [2]];
keyed[iterSym]();
export const viaDynamicKeyCall = _at(_ref11 = keyed[0]).call(_ref11, 4);

// element precision recurses through nested literal layers
const nested = [[[1]], [[2]]];
export const viaNestedRead = _includesMaybeArray(_ref12 = nested[0][0]).call(_ref12, 1);

// a registry-safe COPYING method (with / toSpliced / toSorted return copies) keeps precision
const copied = [[1], [2]];
use(_withMaybeArray(copied).call(copied, 0, [9]));
export const viaCopyingMethod = _atMaybeArray(_ref13 = copied[0]).call(_ref13, 5);

// a spread hands every element out at once - the holder may write elements, so it bails
const fanned = [[1], [2]];
use([...fanned]);
export const viaSpreadEscape = _includes(_ref14 = fanned[0]).call(_ref14, 8);

// a `length` write truncates arbitrary indices - a member WRITE host bails
const trimmed = [[1], [2]];
trimmed.length = 1;
export const viaLengthWrite = _at(_ref15 = trimmed[0]).call(_ref15, 6);

// a destructure slot copies the element value at execution - the READ through the slot keeps
// precision, while the destructured SOURCE binding classifies conservatively as an escape
const [headSlot] = [[7], [8]];
export const viaDestructureSlot = _includesMaybeArray(headSlot).call(headSlot, 7);
const source = [[1], [2]];
const [drawn] = source;
export const viaDestructureSource = _at(_ref16 = source[0]).call(_ref16, 10);

// a SHADOWING inner binding's mutator does not poison the outer binding - references are
// scope-discriminated
const shaded = [[1], [2]];
{
  const shaded = [9];
  _fillMaybeArray(shaded).call(shaded, 0);
}
export const viaShadowedMutator = _atMaybeArray(_ref17 = shaded[0]).call(_ref17, 7);

// an alias hands the same array to another binding - a mutator through the alias is
// invisible to this walk, so the aliasing itself bails
const origin = [[1], [2]];
const alias = origin;
_fillMaybeArray(alias).call(alias, "x");
export const viaAliasedMutation = _includes(_ref18 = origin[0]).call(_ref18, 9);

// a dominating whole-binding reassign IS the value source - precision comes from the new init
let replaced = [[1], [2]];
replaced = [[9]];
export const viaWholeReassign = _atMaybeArray(_ref19 = replaced[0]).call(_ref19, 8);

// iteration hands elements out like a spread does - it bails
const looped = [[1], [2]];
for (const el of looped) use(el);
export const viaForOfEscape = _at(_ref20 = looped[0]).call(_ref20, 9);

// a delete is an element write host
const gapped = [[1], [2]];
delete gapped[0];
export const viaDeleteWrite = _includes(_ref21 = gapped[0]).call(_ref21, 2);