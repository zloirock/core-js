// `include` is the opposite refusal to `exclude`: the user FORCES an entry the resolver would not
// have chosen. on targets where nothing needs a polyfill the guard family would collapse to nothing,
// yet a forced `web.self` puts the ponyfillable hop back - so the render must come back with it
globalThis.forcedBox = { list: ['ab', 'cd'], n: 4 };
export const plain = globalThis.window?.self.forcedBox.list?.at(0);
export const layer = (globalThis.window?.self.forcedBox).list?.at(0);
export const value = globalThis.window?.self.forcedBox.n;
