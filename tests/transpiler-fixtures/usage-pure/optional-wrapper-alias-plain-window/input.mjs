// A realm alias keeps the optional window probe; navigation must not erase it.
export function read(choice) {
  const effects = [];
  const g = globalThis;
  return g.window?.self.box;
}
