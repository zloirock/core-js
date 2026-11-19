// The residual reads the constructor after preserving the nullable holder.
const held = globalThis.window;
for (const { Map: { prototype: proto = fallback() } } = (effect(), held.self);;) { use(proto); break; }
