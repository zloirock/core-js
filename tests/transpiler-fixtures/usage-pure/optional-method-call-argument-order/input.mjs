// An absent optional method skips argument evaluation.
export function read(receiver, argument, key) {
  return receiver.at?.(argument());
}
