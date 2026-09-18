// A static read through an awaited head still needs that method's polyfill.
// Global injects the named method; pure must keep it on the substituted constructor.
async function use() {
  for await (const value of [Map]) value.groupBy([1], x => x);
}
use();
