// an explicit store into an assignment writes the chain its value lands on, as a member write through it does,
// so a static read back through the container is no longer the literal's to fold
const box = { inner: { C: Object } };
let held;
Object.assign(held = box.inner, { C: Map });
export const grouped = box.inner.C.groupBy([1], x => x);
