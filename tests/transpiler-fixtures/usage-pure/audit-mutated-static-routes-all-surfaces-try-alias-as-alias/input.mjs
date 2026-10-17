// A mixed pattern keeps its mutated static on the constructor and substitutes its clean sibling.
const { Promise: { try: tryAlias, allSettled: asAlias } } = globalThis;
Promise.allSettled = asPatch;
export const r11 = [tryAlias, asAlias];
