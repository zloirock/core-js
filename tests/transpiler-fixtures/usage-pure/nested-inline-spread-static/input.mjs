// Nested literal spreads retain exact positions, including empty arrays and holes.
// Declarations keep their native patterns. The call and for-of resolve Object.entries and Array.of.
const [{ values }] = [...[...[Object]]];
const [, { from }] = [...[...[], , ...[Array]]];
const entries = (({ entries: read }) => read)(...[...[Object]]);
export { values, from, entries };
for (const { of: read } of [...[...[(effect(), Array)]]]) read(7);
