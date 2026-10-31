// The computed key short-circuits with its receiver; the sealed call still runs its argument.
// Each default evaluation owns the captured receiver, including a reentrant getter.
export function read(get, key, argument, value = (get()?.[(key(), Symbol.iterator)])(argument())) {
  return value;
}
