// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
const out = [];
for (const { k: { from } = Array } of [{ k: undefined }, { k: Array }]) out.push(from([1]).length);
export { out };
