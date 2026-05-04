// multiple distinct aliased statics, each producing a distinct constructor narrow.
// `const of = Array.of` -> arr1 narrow, `const from = Array.from` -> arr2 narrow.
// each call of the aliased static MUST narrow to its specific Array via
// staticPairFromPolyfillEntry reading injector entry. distinct downstream methods on
// each receiver lock that entry-path read isn't conflated across two registered aliases
const of = Array.of;
const from = Array.from;
const arr1 = of(1, 2, 3);
const arr2 = from('hi');
arr1.at(-1);
arr2.findLast(x => x);
arr1.flat();
arr2.flatMap(x => x);
