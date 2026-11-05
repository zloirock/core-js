// A parameter element can come from its realm default or a supplied realm on separate calls.
// The mixed constructor/static capture serves both branches without sharing their runtime state.
const pick = () => undefined;
function twice([{ Set: S, Array: { of } } = globalThis]) { return [S, of(7)]; }
export const calledTwice = [twice([pick()]), twice([globalThis])];
