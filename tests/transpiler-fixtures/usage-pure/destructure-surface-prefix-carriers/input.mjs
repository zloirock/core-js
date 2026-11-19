// Shared readers capture the receiver after preceding effects; a sole read carries its prefix.
const lead = before(), { Array: { prototype: { at, includes } }, Object: C } = (effect(), globalThis);
const { Array: { prototype: { flat } } } = (another(), globalThis);
use(lead, at, includes, C, flat);
