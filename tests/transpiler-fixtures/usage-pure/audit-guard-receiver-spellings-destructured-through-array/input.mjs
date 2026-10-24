// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Native iteration, source effects and residual bindings stay in order.
const [{ self: fromArray }] = [globalThis];
export const destructuredThroughArray = fromArray.Promise.resolve(1);
