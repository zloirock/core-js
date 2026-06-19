// dropping the dead receiver tail must not over-suppress the kept SE prefix: a side-effecting
// prefix carrying its own polyfillable stays visible and is polyfilled, while the `globalThis`
// receiver is still dropped.
function eff() {}
const { Map } = (Promise.resolve(eff()), globalThis);
export const m = new Map();
