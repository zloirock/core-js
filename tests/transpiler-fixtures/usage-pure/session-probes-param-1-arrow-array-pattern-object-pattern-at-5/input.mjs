function eff() { return Object; }
{
const r = (([{ at }]) => at)([eff()]);
}
