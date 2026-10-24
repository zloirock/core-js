// Shared capture and receiver-default routes preserve independently supported claims.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
let seen;
function observe() {
  try { seen = typeof from; } catch (error) { seen = error.name; }
}
const [{ [(observe(), 'from')]: from }, other] = [Array, {}];
export const result = [seen, from([7]), other];
