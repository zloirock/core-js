const more = {};
{
for (const { w: { keys } } of [{ w: Object }, { w: Object, ...more }]) keys;
}
