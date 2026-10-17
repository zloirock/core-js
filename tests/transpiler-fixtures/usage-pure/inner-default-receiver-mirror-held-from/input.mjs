const held = { from: () => [7] };
const [{ from: heldFrom } = Array] = [held];
export { heldFrom };
