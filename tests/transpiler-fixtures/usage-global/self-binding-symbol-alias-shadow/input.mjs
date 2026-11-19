// A Symbol.X alias (`const { iterator } = Symbol`) and a nested shadow of it that reads its own
// binding: the shadow holds nothing yet, so it is no alias, and the source stays as written with the
// alias's modules. The call spelling is the one this method's walks follow into the shadow; the plain
// read, the held `?.` read and the symbol-keyed extraction mirror the pure twin.
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
