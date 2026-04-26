// `for (const X of ...)` loop variable shadows a known global inside the body:
// subsequent uses of `X` inside the loop skip pure-mode polyfill emission.
for (const Map of items) {
  Map.groupBy([], x => x);
}
for (const Array of items) {
  Array.from([1]);
}