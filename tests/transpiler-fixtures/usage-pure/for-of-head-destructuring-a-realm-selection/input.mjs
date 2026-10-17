// A nested instance read dispatches on the actual iterated receiver.
// Unplugin also mirrors the realm arm's static; Babel retains the native `of` read.
for (const { Array: { prototype: { at }, of } } of [c ? globalThis : fb]) use(at, of);
