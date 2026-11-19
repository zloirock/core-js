// A literal-object loop head retains native entries beside the served array at leaf.
{
for (const { w: { entries }, y: { at } } of [{ w: Object, y: [1] }]) [entries, at];
}
