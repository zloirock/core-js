import "core-js/modules/web.self";
// A realm alias keeps the optional window probe; navigation must not erase it.
export function read(choice) {
  const effects = [];
  const g = typeof self === "object" ? self : globalThis;
  return g?.window?.self.box;
}