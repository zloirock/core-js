// A function-name helper still evaluates an absent-able realm receiver before reading its name.
const effects = [];
export function read() {
  return typeof (() => { effects.push("prefix"); return globalThis.self; })().window.Map.name;
}
