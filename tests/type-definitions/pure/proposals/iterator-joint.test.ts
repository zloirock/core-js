import zip from '@core-js/pure/full/iterator/zip';
import zipKeyed from '@core-js/pure/full/iterator/zip-keyed';

zip([[1, 2, 3], [4, 5, 6]]);
zip([['a', 'b', 'c'], ['d', 'e', 'f']]);
zip([[1, 2, 3], [4, 5, 6]], { mode: "shortest" });
zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] });
zipKeyed({ a: ['a', 'b', 'c', 'd'], b: ['e', 'f'] }, { mode: "shortest" });

// @ts-expect-error
zip(true);
// @ts-expect-error
zip([[1, 2, 3], [4, 5, 6]], { mode: "incorrect" });
// @ts-expect-error
zipKeyed(42);
// @ts-expect-error
zipKeyed({ a: [1, 2, 3], b: [4, 5, 6] }, { foo: "bar" });
