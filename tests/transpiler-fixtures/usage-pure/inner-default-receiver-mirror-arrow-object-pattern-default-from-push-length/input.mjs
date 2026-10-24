// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
const out = [];
(({ k: { from } = Array }) => out.push(from([1]).length))({ k: Array });
export { out };
