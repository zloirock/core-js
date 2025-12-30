import iteratorZip from '@core-js/pure/full/iterator/zip';
import iteratorZipKeyed from '@core-js/pure/full/iterator/zip-keyed';

iteratorZip([[1, 2, 3], [4, 5, 6]]);
iteratorZip([['a', 'b', 'c'], ['d', 'e', 'f']]);
iteratorZip([[1, 2, 3], [4, 5, 6]], { mode: "shortest" });
iteratorZipKeyed({ a: [1, 2, 3], b: [4, 5, 6] });
iteratorZipKeyed({ a: ['a', 'b', 'c', 'd'], b: ['e', 'f'] }, { mode: "shortest" });

// @ts-expect-error
iteratorZip(true);
// @ts-expect-error
iteratorZip([[1, 2, 3], [4, 5, 6]], { mode: "incorrect" });
// @ts-expect-error
iteratorZipKeyed(42);
// @ts-expect-error
iteratorZipKeyed({ a: [1, 2, 3], b: [4, 5, 6] }, { foo: "bar" });
