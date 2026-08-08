// a binding declared by destructuring an element / value that IS a built-in (`const [A] = [Map]`,
// `const { y: B } = { y: Object }`) aliases that built-in, so usage-global injects the static the
// binding calls - the receiver resolver follows the paired literal slot, like a direct `const A = Map`
const [A] = [Map];
A.groupBy([], (x) => x);

const { y: B } = { y: Object };
B.fromEntries([["k", 1]]);
