// Optional symbol keys retain their nullish result.
export function read(choice) {
  const effects = [];
  const list = { undefined: 23, [Symbol.iterator]() { return 31;
  } };
  let it;
  ({ [globalThis.window?.Symbol.iterator]: it } = list);
  return typeof it;
}
