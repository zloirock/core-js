// for-init slot assignment forward-narrows the body: `for (w = R; cond; ) { use w }`. the init
// AssignmentExpression runs before ANY iteration, so a body use is preceded by it. the preceding
// assignment lookup must recognise the ForStatement init slot in addition to block-child
// siblings; otherwise the reassignment slips past and the body use stays the unrefined type.
type Shape = { kind: 'a'; data: string } | { kind: 'b'; data: number[] };
declare const cond: boolean;
declare const init: Shape;
let w: Shape = init;
for (w = { kind: 'b', data: [1, 2, 3] }; cond; ) {
  w.data.at(0);
}
