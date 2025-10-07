import chunks from '@core-js/pure/full/iterator/chunks';
import windows from '@core-js/pure/full/iterator/windows';

declare function getNumberIterator(): Iterator<number>;

const numbersIter = getNumberIterator();

const chunksObj: IteratorObject<number[]> = chunks(numbersIter, 2);
const windowsObj: IteratorObject<number[]> = windows(numbersIter, 4);

const chunkNext = chunksObj.next();
const windowsNext = windowsObj.next();

// @ts-expect-error
chunks(numbersIter);
// @ts-expect-error
chunks(numbersIter, '2');
// @ts-expect-error
chunks(numbersIter, 2, 3);

// @ts-expect-error
windows(numbersIter);
// @ts-expect-error
windows(numbersIter, {});
// @ts-expect-error
windows(numbersIter, 4, 1);
