// an IDENTITY-IIFE root (`((x) => x)(globalThis)`) proves through the identity-param inline
// canon: the buried global substitutes, the live window test guards the chain, the branch
// reads the ponyfill leaf. the guard-shape spelling differs cosmetically between emitters
export const viaIdentityRoot = ((x) => x)(globalThis)?.window?.self?.Array.of(24).at(0);
