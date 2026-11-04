// The plain initializer reads the window once before extracting the constructor.
function root() { visit(); return globalThis; }
export const { Map: ctor } = root().window;
