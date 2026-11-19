// An optional symbol call keeps receiver capture and computed-key effects in the same frame.
export function read(get, key, argument, value = get()?.[(key(), Symbol.iterator)]?.(argument())) {
  return value;
}
