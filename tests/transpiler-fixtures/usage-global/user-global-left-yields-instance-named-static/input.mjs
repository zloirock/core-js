// A capitalised user global on the left of `||` / `??` leaves the right live, and a key naming both an
// instance method and a static of the right's constructor injects that static, as the conditional
// spelling does.
const { concat } = Stub || Iterator;
const { values } = Stub ?? Object;
export { concat, values };
