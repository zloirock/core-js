// The write through alias replaces original.x before alias receives an opaque value.
// Rebinding alias leaves that replacement intact: Array.from and its dependencies are unused.
// Neither flavor imports them; pure preserves the installed custom method.
function run(external) {
  const original = { x: Array };
  let alias = original;
  alias.x = { from: () => 'custom from' };
  alias = external();
  return original.x.from([1]);
}
run(() => ({}));
