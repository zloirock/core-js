// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
const anchor = [1, 2];
export { anchor };

const [{ at }, { keys }] = [a, b];
export { at, keys };

const [{}, { at: at2 }] = [x, arr];
export { at2 };

const [{ other }, { at: at3 }] = [x, arr];
export { other, at3 };

const [{ at: at4 }, ...rest] = [c ? a : x, 1];
export { at4, rest };

const [{ from }, { of }] = [Array, Array];
export { from, of };
