function eff() { return Object; }
{
const [, { at }] = [...[eff(), [1]]];
}
