// minifier-shape `(prefixExpr, ({pat} = R))` collapsed inside a function body as its own
// ExpressionStatement. pre-fix `splitMinifierSequenceDestructure` only walked `programPath
// .get('body')` - the function-body ExpressionStatement was never split and the destructure-
// emitter silently bailed, leaving `from = Array.from` without the `_Array$from` polyfill
function run() {
  let from;
  (sideEffect(), ({ from } = Array));
  return from;
}
run();
