const pick = () => undefined;
function twice([{ Set: S, Array: { of } } = globalThis]) { return [S, of(7)]; }
export const calledTwice = [twice([pick()]), twice([globalThis])];
