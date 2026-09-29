// A later user write replaces the constructor introduced by the captured assignment.
// The capture still returns its original realm and evaluates each effect once.
const log = [];
function read() {
  let C;
  const realm = ({ [(log.push('key'), 'Map')]: C } = (log.push('rhs'), globalThis));
  C = { groupBy: 9 };
  return [realm === globalThis, C.groupBy];
}
export const result = read();
export const effects = log;
