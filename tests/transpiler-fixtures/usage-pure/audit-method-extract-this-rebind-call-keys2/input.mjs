// Object.freeze returns the object with its own grab method. The extracted method
// reads keys2 from the receiver supplied to call.
const frozen = { keys2: ['k'], grab() { return this.keys2.at(6); } };
const alias = Object.freeze(frozen);
const m5 = alias.grab;
m5.call({ keys2: 'kk' });
