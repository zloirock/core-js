import _globalThis from "@core-js/pure/actual/global-this";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// `let` block-scoped binding written from inside a NewExpression IIFE
// (`new function () { x = "hi" }()`) - straight-line analysis must walk the
// `let` binding through its block-scope, matching the var-scope walk used
// for the original `var`-binding shape. distinct receiver methods on each
// post-call read confirm the typed narrow fires per usage site
{
  let x;
  new function () {
    x = "hi";
  }();
  var first = _atMaybeString(x).call(x, 0);
  var contains = _includesMaybeString(x).call(x, "h");
  _globalThis.firstCh = first;
  _globalThis.hasH = contains;
}