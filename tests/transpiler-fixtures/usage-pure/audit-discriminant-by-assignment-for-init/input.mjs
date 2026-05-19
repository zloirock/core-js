// for-init slot assignment forward-narrows the body: `for (w = R; cond; ) { use
// w }`. the init AssignmentExpression runs before ANY iteration, so a body use
// is preceded by it. `findPrecedingBlockAssignment` recognises the ForStatement
// init slot in addition to block-child siblings; without that branch the
// for-init reassignment slips past and the narrow-by-assignment falls back to
// the unrefined declared type
type Shape = { kind: 'a'; data: string } | { kind: 'b'; data: number[] };
declare const cond: boolean;
declare const init: Shape;
let w: Shape = init;
for (w = { kind: 'b', data: [1, 2, 3] }; cond; ) {
  w.data.at(0);
}
