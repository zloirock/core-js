// Optional symbol keys retain their nullish result.
export function read(choice) {
  const effects = [];
  const list = { undefined: 23 };
  return globalThis.window?.Symbol.iterator in list;
}
