import 'core-js/full';

declare function getNumberIterator(): Iterator<number>;
declare function getStringIterator(): Iterator<string>;

const numIter = getNumberIterator();
const strIter = getStringIterator();

numIter.zip([[1, 2, 3], [4, 5, 6]]);
strIter.zip([['a', 'b', 'c'], ['d', 'e', 'f']]);
numIter.zip([[1, 2, 3], [4, 5, 6]], { mode: "shortest" });
numIter.zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] });
numIter.zipKeyed({ a: ['a', 'b', 'c', 'd'], b: ['e', 'f'] }, { mode: "shortest" });

// @ts-expect-error
numIter.zip(true);
// @ts-expect-error
numIter.zip([[1, 2, 3], [4, 5, 6]], { mode: "incorrect" });
// @ts-expect-error
numIter.zipKeyed(42);
// @ts-expect-error
numIter.zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] }, { foo: "bar" });
