// Optional symbol keys retain their nullish result.
export function read(choice) {
  const effects = [];
  const list = { undefined: 23, [Symbol.iterator]() { return 31;
  } };
  function pick({ [globalThis.window?.Symbol.iterator]: it }) { return typeof it;
  } return pick(list);
}
