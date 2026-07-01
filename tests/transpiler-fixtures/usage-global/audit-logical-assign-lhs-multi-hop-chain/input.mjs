// `globalThis.self.Map ||= X` - multi-hop proxy-global chain. inner identifier visits
// trigger Map / Promise polyfill emission (the chain IS a polyfillable read of the leaf
// before the assignment). usage-global stays silent (no warning); pure mode is where the
// LHS warning fires for the same chain via the proxy-global member-name resolution
globalThis.self.Map ||= 1;
globalThis.window.Promise ??= 2;
