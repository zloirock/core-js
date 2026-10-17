{
const r = (({ a: [{ b: { hasOwn } }] }) => hasOwn)({ a: [{ b: Object }] });
}
