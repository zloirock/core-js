// numeric-index access on an array literal with a leading spread - the element type
// depends on the runtime length of the spread source. the resolver currently picks the
// literal at the given position as-is (precision-edge); narrowing for polyfill dispatch
// does not fire, the generic path is taken
function pickFirst<T extends [unknown, unknown]>(t: T): T[1] {
  return t[1] as T[1];
}
const a: number[] = [10, 20];
const result = pickFirst([...a, 'tail'] as const);
result.toString();
