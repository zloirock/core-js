// an object that INHERITS a built-in prototype dispatches that prototype's methods, so the installed
// prototype names the receiver's family and the family-specific helper is chosen. that is sound for a
// PURE helper only because it keys on the prototype CHAIN rather than on the receiver being an
// instance of the family - an object merely inheriting the prototype is served, not thrown at. a
// prototype whose family cannot be named keeps the generic helper. distinct method per line
let installed = {};
Object.setPrototypeOf(installed, Array.prototype);
export const a = installed.at(-1);
let unnameable = {};
Object.setPrototypeOf(unnameable, mystery);
export const b = unnameable.includes(1);
