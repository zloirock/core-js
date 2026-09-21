// A finite loop element remains a static receiver through its binding and literal spreads.
// Member and destructured reads need their named static, without a whole namespace escape.
for (const ctor of [Array]) ctor.of(1);
for (const ctor of [...[Object]]) {
  const { hasOwn } = ctor;
  use(hasOwn({}, 'x'));
}
for (const [ctor] of [...[[Promise]]]) ctor.withResolvers();
