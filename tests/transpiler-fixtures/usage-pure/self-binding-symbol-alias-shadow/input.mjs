// A Symbol.X alias (`const { iterator } = Symbol`) and a nested shadow of it that reads its own
// binding: the shadow holds nothing yet, so it is no alias - judging it stops at the binding and
// leaves it and its reads native, while the outer alias still folds. A plain read, a call, a held
// `?.` read, and a symbol-keyed extraction reading its own binding.
const { iterator } = Symbol;
{
  const { iterator } = iterator;
  first[iterator];
}
{
  const { iterator } = iterator();
  second[iterator];
}
{
  const iterator = iterator?.x;
  third[iterator];
}
const { [Symbol.iterator]: method } = method;
fourth[method];
last[iterator];
