// computed-key proxy-global member as the optional-chain root (`globalThis['list']?....`): the
// guard-root resolver must rebuild the bracket accessor onto the pure import (`_globalThis['list']`),
// not leak raw `globalThis` - exercises the computed branch of the proxy-global chain resolver
globalThis['list']?.flat().includes(1);
