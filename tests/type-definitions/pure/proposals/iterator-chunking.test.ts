import iteratorChunks from '@core-js/pure/full/iterator/chunks';
import iteratorWindows from '@core-js/pure/full/iterator/windows';

declare function getNumberIterator(): Iterator<number>;

const numbersIter = getNumberIterator();

const chunksObj: Iterator<number[]> = iteratorChunks(numbersIter, 2);
const windowsObj: Iterator<number[]> = iteratorWindows(numbersIter, 4);

const chunkNext = chunksObj.next();
const windowsNext = windowsObj.next();

// @ts-expect-error
iteratorChunks(numbersIter);
// @ts-expect-error
iteratorChunks(numbersIter, '2');
// @ts-expect-error
iteratorChunks(numbersIter, 2, 3);

// @ts-expect-error
iteratorWindows(numbersIter);
// @ts-expect-error
iteratorWindows(numbersIter, {});
// @ts-expect-error
iteratorWindows(numbersIter, 4, 1);
