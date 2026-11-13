// A retained read performs the store once, even when the later hop throws.
export function read() {
  let held;
  try { const { resolve } = (held = globalThis.self).window.Promise;
  return [typeof resolve, held === globalThis.self];
  } catch (error) { return [error.name, held === globalThis.self];
  }
}
