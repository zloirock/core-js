function eff() { return Object; }
{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ w: [Object, eff()] });
}
