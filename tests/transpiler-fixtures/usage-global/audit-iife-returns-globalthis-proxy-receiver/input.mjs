// IIFE returning globalThis used as proxy-global receiver: the inner needle locator must
// account for subsumed-proxy-chain elimination (the outer chain `<receiver>.Promise.resolve`
// has its receiver-chain collapsed to the polyfilled binding alone, leaving an inner needle
// shape that does not appear in the outer overwrite content). regression: transform-queue
// previously threw `could not locate inner needle in outer content` on this shape
(() => { return globalThis; })().Promise.resolve(1);
