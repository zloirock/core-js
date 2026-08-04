import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.includes";
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
rows.at(0);
label.includes('x');
tags.includes('x');