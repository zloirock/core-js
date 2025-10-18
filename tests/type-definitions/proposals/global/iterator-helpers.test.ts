import 'core-js/full';
//
declare function getNumberIterator(): Iterator<number>;

const iter = getNumberIterator();
const res: Iterator<number> = iter.map(n => n + 1);
