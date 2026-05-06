// AssignmentPattern wrapper at outer level coexisting with RestElement at outer level:
// rest gathers all OTHER own keys of globalThis, so dropping `Array: {from}` outright would
// change runtime semantics (`rest.Array` becomes defined, originally excluded). cascade
// emits `Array: _unused` sentinel placeholder for the consumed slot, polyfill emits
// `from = _Array$from` separately, rest still excludes the Array key. AssignmentPattern
// is at INNER level (around `{from}`) - peel happens inside the chain
const { Array: { from } = {}, ...rest } = globalThis;
from('hi');
rest.Object;
