import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
// Discriminant narrow when TS expression-wrappers (`as` / `!` / `satisfies`) sit on the
// guard's member-expression object slot. earlier `peelParensAndChain` peeled only parens
// + ChainExpression, leaving TSAsExpression / TSNonNullExpression / TSSatisfiesExpression
// unstripped - `pathKey` then returned null and the guard never matched. fix routes both
// the equality sides AND the member-object slot through `unwrapRuntimeExpr`, which peels
// all transparent runtime wrappers in one step. distinct methods per branch
// (.repeat string / .at array / .padEnd string / .at array) pin emission to narrow:
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