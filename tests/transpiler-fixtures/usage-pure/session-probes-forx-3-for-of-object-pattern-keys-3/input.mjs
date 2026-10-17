{
for (const { w: { keys } } of [{ w: Object }, { get w() { return Object; } }]) keys;
}
