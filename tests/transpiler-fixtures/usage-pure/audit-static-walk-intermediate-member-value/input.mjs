// A container slot holding a constructor member read resolves that constructor.
// The nested static receives its pure method through the intermediate slot.
const wrapper = { a: globalThis.Array };
const { a: { from } } = wrapper;
from([1, 2, 3]);
