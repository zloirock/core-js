// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims.
const pick = () => undefined;
function twice([{ Set: S, Array: { of } } = globalThis]) { return [S, of(7)]; }
export const calledTwice = [twice([pick()]), twice([globalThis])];
