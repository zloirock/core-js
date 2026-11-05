// A shorthand slot denotes the local binding's value just like an explicit property.
// Its native from read preserves Array result inference for the later at call.
const Array = globalThis.Array;
const wrapper = { Array };
const { Array: { from } } = wrapper;
from(['x']).at(0);
