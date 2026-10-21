// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
let c1 = 0;
const [{ [(c1++, 'from')]: from }, other] = [Array, {}];
let c2 = 0;
const arr = [1];
const { y: { [(c2++, 'a') + 't']: at } } = { y: arr };
export const r = [from, at, other, c1, c2];
