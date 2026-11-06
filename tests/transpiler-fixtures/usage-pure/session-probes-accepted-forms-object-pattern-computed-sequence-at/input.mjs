function eff() { return Object; }
{
const { [(eff(), 'w')]: { at: a } } = { w: 'x' };
}
