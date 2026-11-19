// the seal over a LIVE `?.` was always rendered - its short-circuit is the guard's own subject
export const sealedRootLiveOptional = ((globalThis.window?.self)).window.Promise.resolve(1);
