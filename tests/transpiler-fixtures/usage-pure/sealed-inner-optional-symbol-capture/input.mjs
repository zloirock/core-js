// A sealed symbol call keeps the inner optional receiver through its key and argument.
// The nullish branch skips the key, then evaluates the argument before throwing.
export function read(box) {
  return (box?.rows[(key(), Symbol.iterator)])(argument());
}
// A nullish tail still evaluates the key before the whole-call helper rejects it.
export function iterate(box) {
  return (box?.rows[(key(), Symbol.iterator)])();
}
