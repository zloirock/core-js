{
const r = (({ a: { [Symbol.iterator]: it } }) => it)({ a: [1] });
}
