const c = 1;
const userObj = {};
{
const r = (({ a: [{ hasOwn }] }) => hasOwn)({ a: [c ? Object : userObj] });
}
