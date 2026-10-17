// nested mirror, sealed receiver
export function viaMirrorSealed({ Array: { of } } = (globalThis.window?.window).self) { return of; }
