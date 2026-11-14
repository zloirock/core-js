// The selecting realm's effects run once before its guarded static lookup.
export function read(choice, custom, effect) {
  return ((effect(), choice) ? globalThis : custom)?.Object.fromEntries([["x", 3]]);
}
