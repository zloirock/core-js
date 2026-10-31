// A re-readable built-in surface serves several default slots; a sole slot over a call receiver
// evaluates the call once inside the mirror. Supplied arguments keep their own properties.
export const b2 = (() => { function f({ at, flat } = Array.prototype) { return [at, flat]; } return f().length; })();
export const r = [b2];
