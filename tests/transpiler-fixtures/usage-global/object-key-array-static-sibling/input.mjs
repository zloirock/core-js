// The object key and native array iteration select a static receiver once.
// The static getter remains ahead of its binding and the neighbouring element binding.
const held = { k: [Math] };
export const { k: [{ sign }, tail] } = held;
