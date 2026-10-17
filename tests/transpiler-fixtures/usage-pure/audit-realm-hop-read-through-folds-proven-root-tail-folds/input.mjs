// ... the same over an opaque-but-proven root
const proven = () => globalThis;
export const provenRootTailFolds = proven()?.window?.self?.window?.chrome;
