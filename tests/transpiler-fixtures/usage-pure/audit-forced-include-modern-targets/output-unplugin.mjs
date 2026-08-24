// `include` is the opposite refusal to `exclude`: the user FORCES an entry the resolver would not
// have chosen. on targets where nothing needs a polyfill the guard family would collapse to nothing,
// yet a forced `web.self` puts the ponyfillable hop back - so the render must come back with it
import _self from "@core-js/pure/actual/self";

globalThis.forcedBox = { list: ['ab', 'cd'], n: 4 };

export const plain = null == globalThis.window ? void 0 : _self.forcedBox.list?.at(0);
export const layer = ((null == globalThis.window ? void 0 : _self)?.forcedBox).list?.at(0);
export const value = null == globalThis.window ? void 0 : _self.forcedBox.n;