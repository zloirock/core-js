const iterated = { inner: { C: Iterator } };
const same = iterated;
const member = same.inner;
member.C = userValue;
export const wrapped = iterated.inner.C.from([1]);
