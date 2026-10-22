// The receiver prefix runs once even when the optional raw method is absent.
export function read(receiver, prefix, argument) {
  return (prefix(), receiver).read?.(argument()).includes(2);
}
