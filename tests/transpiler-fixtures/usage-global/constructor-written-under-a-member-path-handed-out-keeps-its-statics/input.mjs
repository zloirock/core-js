// a member path handed out hands out the container it holds with every constructor written under it -
// directly, deeper down or through an alias of a prefix - while a sibling path handed out takes nothing
// written under another
const first = { inner: { C: Object } };
first.inner.C = Map;
use(first.inner);
const second = { inner: { deep: { C: Object } } };
second.inner.deep.C = Promise;
use(second.inner);
const third = { a: { b: { C: Object } } };
const prefix = third.a;
prefix.b.C = URL;
use(third.a.b);
const fourth = { a: { C: Object }, b: { C: Object } };
fourth.a.C = Iterator;
use(fourth.b);
