// nested mirror, passthrough sibling beside the polyfilled leaf
export function viaMirrorPassthrough({ Math: { floor }, Array: { of } } = globalThis.window?.self) { return [floor, of]; }
