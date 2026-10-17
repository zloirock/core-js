// Static extractions retain their rest exclusions; a sibling must not reclaim the sentinel.
const [{ 'from': from, ...rest }, tail] = [Array, 1];
const [{ [Symbol.iterator]: iterator, of, ...remaining }] = [Array];
export const r = [from([tail]), of(2), typeof iterator, Object.hasOwn(rest, 'from'), Object.hasOwn(remaining, 'of')];
