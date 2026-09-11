import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// LabeledStatement wrapping an IfStatement preceding-exit guard. Exit-condition resolution
// gates on t.isIfStatement(sibling.node) - LabeledStatement around it would fall through
// to assertion-statement parse and miss the early-exit narrow. Sibling-guard parsing now
// peels LabeledStatement to its body before dispatching, so labeled early-exit narrows
// the trailing access identically to a bare `if (...) return`
declare const x: string | string[];
function fn() {
  outer: if (typeof x !== 'string') return;
  _atMaybeString(x).call(x, 0);
}
fn();