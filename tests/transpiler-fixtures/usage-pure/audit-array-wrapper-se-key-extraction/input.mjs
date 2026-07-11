// an SE-computed-key leaf under an ARRAY-wrapped receiver still extracts (the wrapper peel wins
// over the SE-key keep-in-residual dispatch); the key effect runs once in the kept residual
let c1 = 0;
const [{ [(c1++, 'from')]: from }, other] = [Array, {}];
// nested-pattern variant with a plus-fold key on an instance method
let c2 = 0;
const arr = [1];
const { y: { [(c2++, 'a') + 't']: at } } = { y: arr };
export const r = [from, at, other, c1, c2];
