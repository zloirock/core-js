// Computed-key effects precede lookup without sealing the optional call from its continuation.
export function read(get, key, argument, value = get()?.[(key(), Symbol.iterator)]?.(argument()).toString()) {
  return value;
}
