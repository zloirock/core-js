// nested scope where a temporary `_ref` could leak into outer scope output: the
// rewrite must keep its temps lexically scoped.
const f = x => x?.at(0)?.at(0)?.includes(1);
