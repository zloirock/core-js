// A literal wrapper remains native; the constructor it reads needs its static namespace.
const w = globalThis.window;
const [{ resolve }] = [w.Promise];
resolve(1);
