{
for (var { w: { entries } } of [{ w: Object }]) entries;
}
{
for (const { w: { x: { entries } } } of [{ w: { x: Object } }]) entries;
}
