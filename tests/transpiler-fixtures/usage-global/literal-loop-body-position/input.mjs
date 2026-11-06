// A bound literal wrapper keeps native statics after an earlier statement.
for (const row of [{ C: Object }]) {
  effect();
  const { C: { keys } } = (row);
  use(keys);
}
