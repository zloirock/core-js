// Both arms select supported pure realm bindings.
// The receiver is captured before the key effect and the method binding follows it.
const cond = false;
const { Array: { [(eff(), "from")]: from } } = cond ? globalThis : self;
typeof from;
