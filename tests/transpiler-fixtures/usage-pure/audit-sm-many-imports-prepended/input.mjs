// source map mapping when many polyfill imports are prepended: line offsets in the
// rest of the file must shift consistently.
Array.from([1]);
Map.entries();
Set.intersection;
Object.values({});
Promise.all([]);
Array.of(1);
