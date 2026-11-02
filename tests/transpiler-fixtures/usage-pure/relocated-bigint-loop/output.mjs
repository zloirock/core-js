import _at from "@core-js/pure/actual/instance/at";
// A BigInt default and computed key survive moving a loop pattern into its body.
for (const _ref of rows) {
  const at = _at(_ref);
  const {
    limit = 10n,
    [1n]: first
  } = _ref;
  use(at, limit, first);
}