// TWO live `?.` over a SEALED short-circuiting value: both take their undefinedness from the same
// probe below the seal, so ONE test expresses them. counted as two sources the claim STOOD DOWN and
// shipped a native static - the one answer usage-pure may never give. the seal does not CREATE
// undefinedness (it only makes the read above it observable), so a sealed source keys by the source
// its own value has, which is what the unsealed spelling keys by too.
export const twoOptionalsSealed = ((globalThis.window?.self)?.Array?.of(5));
export const twoOptionalsSealedMember = ((globalThis.window?.self)?.Promise?.resolve);
export const threeOptionalsSealed = ((globalThis.window?.self)?.Array?.of?.(6));
// NEGATIVE: the same two optionals with NO seal - the locked single-test shape
export const twoOptionalsBare = globalThis.window?.self?.Array?.of(7);
// NEGATIVE: one optional over the sealed value - one source either way
export const oneOptionalSealed = ((globalThis.window?.self)?.Array.of(8));
