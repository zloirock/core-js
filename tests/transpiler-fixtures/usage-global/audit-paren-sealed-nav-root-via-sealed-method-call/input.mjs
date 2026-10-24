// the sealed root serves every OPTIONAL claim spelling like the alias of the same value:
// the METHOD-call claim folds into the guard, the CALL tail rides the branch (the guard-paren
// seam differs cosmetically between emitters), the DESTRUCTURE extraction receives the
// guarded value, and the bare CTOR read claims like the unsealed litErased canon
export const viaSealedMethodCall = (globalThis.window?.self.window)?.Array.of?.(3);
