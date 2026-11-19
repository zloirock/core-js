// A delete through a saved environment probe keeps the guard over that probe.
const held = globalThis.window;
let saved;
delete (saved = held)?.self.Array.temporary;
