// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
const Foo = Array;
const wrapper = { a: Foo };
const { a: { from } } = wrapper;
const arr = from('hi');
arr.findLast(x => x);
arr.fill(0);
