const { self: { window: extractedNested } } = globalThis;
export const destructuredNested = extractedNested?.Object.fromEntries([['d', 4]]);
