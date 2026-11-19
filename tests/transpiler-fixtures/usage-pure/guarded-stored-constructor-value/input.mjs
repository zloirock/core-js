// A stored constructor keeps the environment probe and its absent value.
// The argument runs only when the constructor's optional call is reached.
let held;
const result = (held = globalThis.window?.self.Number)?.isInteger(effect());
use(result, held === undefined);
