// shorthand property in static-wrapper ObjectExpression: `{ Array }` is shorthand for
// `{ Array: Array }`. walker reads prop.key (Identifier name 'Array') and prop.value
// (Identifier reference to Array). The shorthand shape must classify the same as the
// explicit form for static-object descent. distinct prototype methods on later receiver
const Array = globalThis.Array;
const wrapper = { Array };
const { Array: { from } } = wrapper;
from(['x']).at(0);
