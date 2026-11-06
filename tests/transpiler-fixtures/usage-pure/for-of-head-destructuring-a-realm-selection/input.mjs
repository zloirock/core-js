// A nested instance read dispatches on the actual iterated receiver.
// The selected realm arm also supplies its static through the common mirror.
for (const { Array: { prototype: { at }, of } } of [c ? globalThis : fb]) use(at, of);
