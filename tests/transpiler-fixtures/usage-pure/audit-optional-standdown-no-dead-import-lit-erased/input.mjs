// literal root: ONE window test guards the claim, the branch reads the ponyfill ctor
export const litErased = globalThis.window?.self?.Set;
