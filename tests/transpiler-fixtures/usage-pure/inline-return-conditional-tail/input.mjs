// The continuation stays inside the conditional call's short circuit.
// Neither the static argument nor the following computed read runs when the callee is absent.
let forward;
if (flag) forward = () => ({ window: { Array } });
export const value = forward?.().window.Array.of(observe())[observeKey()];
