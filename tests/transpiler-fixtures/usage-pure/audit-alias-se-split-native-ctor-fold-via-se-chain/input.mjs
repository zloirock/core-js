// the same split-and-re-anchor holds a member chain on the result together
let A2;
(0, ({ Array: A2 } = globalThis));
export const viaSeChain = A2.from([4, 5]).at(-1);
