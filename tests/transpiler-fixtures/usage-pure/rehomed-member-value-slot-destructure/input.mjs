// a slot written with a member of another container (`box.k = NS.inner`) holds what that container
// holds there: a nested pattern reading through the slot reaches the written constructor beside the
// literal's own, and usage-global injects the static for each
const NS = { inner: { A: Map } };
const box = { k: { A: Set } };
box.k = NS.inner;
const { k: { A } } = box;
A.groupBy(src, fn);
