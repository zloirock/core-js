// receiver-SE + computed-key-SE under an OPTIONAL CALL: `(a(), arr)[(k(), 'flat')]?.()`.
// the member access is non-optional, so native evaluates the receiver SE (`a()`) before the
// key SE (`k()`); the optional call must not reorder them to key-then-receiver
const r = (a(), arr)[(k(), 'flat')]?.();
r;
