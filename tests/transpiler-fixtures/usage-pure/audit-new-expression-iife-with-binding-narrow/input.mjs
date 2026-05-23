// `let` block-scoped binding written from inside a NewExpression IIFE
// (`new function () { x = "hi" }()`) - straight-line analysis must walk the
// `let` binding through its block-scope, matching the var-scope walk used
// for the original `var`-binding shape. distinct receiver methods on each
// post-call read confirm the typed narrow fires per usage site
{
  let x;
  new function () { x = "hi"; }();
  var first = x.at(0);
  var contains = x.includes("h");
  globalThis.firstCh = first;
  globalThis.hasH = contains;
}
