// An effect-free local call names the realm hop of a nested static read.
export function read() {
  function key() { return "self";
  } return typeof globalThis[key()].Promise.resolve;
}
