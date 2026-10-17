const once = ([{ Set: S, Array: { of } } = globalThis]) => [S, of(7)];
export const calledOnce = once([]);
