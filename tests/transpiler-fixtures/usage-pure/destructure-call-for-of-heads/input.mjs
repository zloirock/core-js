// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions.
const headed = () => ({ a: Object });
for (const { a: viaHead } of [headed()]) use(viaHead.is(5, 5));
const headedDeep = () => ({ n: Array });
for (const { n: { of: viaHeadDeep } } of [headedDeep()]) use(viaHeadDeep(6));
const built = () => ({ a: Math });
for (const { a: { sinh: viaTwoElements } } of [(() => ({ a: Math }))(), built()]) use(viaTwoElements(1));
