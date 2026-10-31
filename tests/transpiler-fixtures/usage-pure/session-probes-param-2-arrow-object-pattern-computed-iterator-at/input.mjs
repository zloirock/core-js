{
const r = (({ a: { [Symbol.iterator]: it, at } }) => [it, at])({ a: [1] });
}
