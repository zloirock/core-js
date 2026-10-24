import _Array$of from "@core-js/pure/actual/array/of";
import _Object$hasOwn from "@core-js/pure/actual/object/has-own";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$withResolvers from "@core-js/pure/actual/promise/with-resolvers";
// A finite loop element remains a static receiver through its binding and literal spreads.
// Member and destructured reads need their named static, without a whole namespace escape.
for (const ctor of [Array]) _Array$of(1);
for (const ctor of [...[Object]]) {
  const hasOwn = _Object$hasOwn;
  use(hasOwn({}, 'x'));
}
for (const [ctor] of [...[[_Promise]]]) _Promise$withResolvers();