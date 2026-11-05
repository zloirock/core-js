// Effectful static and instance keys are evaluated once before their captured property reads.
// The from and at claims use their own receiver families.
let c1 = 0;
const [{ [(c1++, 'from')]: from }, other] = [Array, {}];
// nested-pattern variant with a plus-fold key on an instance method
let c2 = 0;
const arr = [1];
const { y: { [(c2++, 'a') + 't']: at } } = { y: arr };
export const r = [from, at, other, c1, c2];
