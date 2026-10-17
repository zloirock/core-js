// an instance synth slot may spell an OBSERVABLE receiver once - a sole-prop pattern does
export const b1 = (() => { function f({ at } = Array.prototype) { return at; } return typeof f(); })();
export const r = [b1];
