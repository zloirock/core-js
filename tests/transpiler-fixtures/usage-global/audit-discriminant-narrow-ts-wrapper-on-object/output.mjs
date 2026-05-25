import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// Discriminant narrow when TS expression-wrappers (`as` / `!` / `satisfies`) sit on the
// guard's member-expression object slot. previously paren+chain peel left TSAsExpression /
// TSNonNullExpression / TSSatisfiesExpression unstripped - the path key returned null and
// the guard never matched. fix routes both equality sides AND the member-object slot
// through the same runtime-transparent peel, so all wrappers are stripped in one step.
// distinct methods per branch (.repeat string / .at array / .padEnd string / .includes
// array) pin emission to narrow:
type Box = {
  kind: 'a';
  v: string;
} | {
  kind: 'b';
  v: number[];
};
function probe(box: Box) {
  if ((box as Box).kind === 'a') {
    box.v.repeat(2);
  }
  if ((box as Box).kind === 'b') {
    box.v.at(-1);
  }
  if (box!.kind === 'a') {
    box.v.padEnd(8, '.');
  }
  if ((box satisfies Box).kind === 'b') {
    box.v.includes(2);
  }
}
probe(undefined as any);