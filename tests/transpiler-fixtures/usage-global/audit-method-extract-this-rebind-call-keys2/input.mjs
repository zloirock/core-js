// an identity-returning callee result held = an untracked alias; the PROTO slot of
// setPrototypeOf makes the receiver inherit the methods
const frozen = { keys2: ['k'], grab() { return this.keys2.at(6); } };
const alias = Object.freeze(frozen);
const m5 = alias.grab;
m5.call({ keys2: 'kk' });
