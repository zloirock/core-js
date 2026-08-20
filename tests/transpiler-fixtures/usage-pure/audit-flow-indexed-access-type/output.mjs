import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// @flow
// Flow's indexed access (`Obj['key']`) and its optional form are separate node types from the
// TS spelling, and the annotation dispatcher listed only the TS one - so the annotation resolved
// to nothing and the receiver widened. Distinct methods per arm: Array -> es.array.at,
// string -> es.string.includes, Array -> es.array.includes. The optional form additionally admits
// undefined, which the pure flavor must still guard. The last arm is CHAINED: the key reader was
// spelled per site, so only the single-hop form was paired and a chain bailed to the generic.
type Store = {
  rows: Array<number>,
  label?: string,
  deep: {
    tags: Array<string>
  },
};
declare var rows: Store['rows'];
declare var label: Store?.['label'];
declare var tags: Store['deep']['tags'];
_atMaybeArray(rows).call(rows, 0);
_includesMaybeString(label).call(label, 'x');
_includesMaybeArray(tags).call(tags, 'x');