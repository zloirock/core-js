import iteratorZip from '@core-js/pure/full/iterator/zip';
import iteratorZipKeyed from '@core-js/pure/full/iterator/zip-keyed';
import { assertCoreJSIteratorLike } from '../../helpers';

const zipped1 = iteratorZip([[1, 2, 3], [4, 5, 6]]);
assertCoreJSIteratorLike<number[]>(zipped1);
const zipped2 = iteratorZip([['a', 'b', 'c'], ['d', 'e', 'f']]);
assertCoreJSIteratorLike<string[]>(zipped2);
const zipped3 = iteratorZip([[1, 2, 3], [4, 5, 6]], { mode: 'shortest' });
assertCoreJSIteratorLike<number[]>(zipped3);
const zipped4 = iteratorZipKeyed({ a: [1, 2, 3], b: [4, 5, 6] });
assertCoreJSIteratorLike<Record<PropertyKey, number>>(zipped4);
const zipped5 = iteratorZipKeyed({ a: ['a', 'b', 'c', 'd'], b: ['e', 'f'] }, { mode: 'shortest' });
assertCoreJSIteratorLike<Record<PropertyKey, string>>(zipped5);

// @ts-expect-error
iteratorZip(true);
// @ts-expect-error
iteratorZip([[1, 2, 3], [4, 5, 6]], { mode: 'incorrect' });
// @ts-expect-error
iteratorZipKeyed(42);
// @ts-expect-error
iteratorZipKeyed({ a: [1, 2, 3], b: [4, 5, 6] }, { foo: 'bar' });
