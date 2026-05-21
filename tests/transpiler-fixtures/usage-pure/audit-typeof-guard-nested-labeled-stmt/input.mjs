// nested LabeledStatement (`outer: inner: if (...) return;`) - parseSiblingGuards used to
// peel only ONE label layer, so the second-level label would block the if-stmt dispatch
// and the early-exit narrow drops. switched to a `while` loop so any depth of label
// wrapping unwraps cleanly to the contained if / expression statement
declare const x: string | string[];
function fn() {
  outer: inner: if (!Array.isArray(x)) return;
  x.at(0);
}
fn();
