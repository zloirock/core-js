import iteratorZip from '@core-js/pure/full/iterator/zip';
import iteratorZipKeyed from '@core-js/pure/full/iterator/zip-keyed';
import { CoreJSIteratorAndIteratorLike } from '../../helpers';

const zipped1: CoreJSIteratorAndIteratorLike<number[]> = iteratorZip([[1, 2, 3], [4, 5, 6]]);
const zipped2: CoreJSIteratorAndIteratorLike<string[]> = iteratorZip([['a', 'b', 'c'], ['d', 'e', 'f']]);
const zipped3: CoreJSIteratorAndIteratorLike<number[]> = iteratorZip([[1, 2, 3], [4, 5, 6]], { mode: 'shortest' });
const zipped4: CoreJSIteratorAndIteratorLike<Record<PropertyKey, number>> = iteratorZipKeyed({ a: [1, 2, 3], b: [4, 5, 6] });
const zipped5: CoreJSIteratorAndIteratorLike<Record<PropertyKey, string>> = iteratorZipKeyed({ a: ['a', 'b', 'c', 'd'], b: ['e', 'f'] }, { mode: 'shortest' });

// @ts-expect-error
iteratorZip(true);
// @ts-expect-error
iteratorZip([[1, 2, 3], [4, 5, 6]], { mode: 'incorrect' });
// @ts-expect-error
iteratorZipKeyed(42);
// @ts-expect-error
iteratorZipKeyed({ a: [1, 2, 3], b: [4, 5, 6] }, { foo: 'bar' });
