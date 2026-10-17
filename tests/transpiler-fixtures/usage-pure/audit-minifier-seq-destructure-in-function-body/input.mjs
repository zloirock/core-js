// minifier-shape `(prefixExpr, ({pat} = R))` collapsed inside a function body as its own
// ExpressionStatement. pre-fix the split only walked the Program body, so the function-body
// ExpressionStatement was never split and the destructure rewrite silently bailed, leaving
// `from = Array.from` without the `_Array$from` polyfill
function run() {
  let from;
  (sideEffect(), ({ from } = Array));
  return from;
}
run();
