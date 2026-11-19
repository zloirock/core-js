// A literal-container constructor read keeps its source fallback instead of replacing the slot wholesale.
{
const { w: { Map: M = fb } } = { w: globalThis }; M();
}
