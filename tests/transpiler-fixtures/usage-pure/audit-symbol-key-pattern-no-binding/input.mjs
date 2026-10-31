// computed Symbol-keyed property in destructure pattern. the pattern-identifier walk visits
// only `.value` (binding name), not `.key` - Symbol.iterator reference inside key
// position is a runtime expression, not a binding. binding `iter` is what the walk reports
const { [Symbol.iterator]: iter } = obj;
iter;
