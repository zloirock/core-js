// A static declaration and a sibling expression arrow keep independent claims.
// The arrow captures its receiver inside its own body.
const { Array: { from } } = globalThis, val = (() => [].values())();
export { from, val };
