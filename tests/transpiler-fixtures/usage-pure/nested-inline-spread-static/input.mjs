// Nested literal spreads retain exact positions, including empty arrays and holes.
// Both destructuring and caller arguments must select their own static receiver.
const [{ values }] = [...[...[Object]]];
const [, { from }] = [...[...[], , ...[Array]]];
const entries = (({ entries: read }) => read)(...[...[Object]]);
export { values, from, entries };
for (const { of: read } of [...[...[(effect(), Array)]]]) read(7);
