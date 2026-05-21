// LabeledStatement wrapping an IfStatement preceding-exit guard. resolveExitCondition
// gates on t.isIfStatement(sibling.node) - LabeledStatement around it would fall through
// to assertion-statement parse and miss the early-exit narrow. parseSiblingGuards now
// peels LabeledStatement to its body before dispatching, so labeled early-exit narrows
// the trailing access identically to a bare `if (...) return`
declare const x: string | string[];
function fn() {
  outer: if (typeof x !== 'string') return;
  x.at(0);
}
fn();
