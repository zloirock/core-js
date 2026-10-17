function eff() { return Object; }
{
for (const { w: { keys } } of [{ [eff()]: Object }, { [eff()]: Object }]) keys;
}
