// The later initializer may replace the variable holding the first element.
// Property reads still use the value captured before that replacement.
export function read(receiver, replace) {
  const [{ other, at }, tail] = [receiver, receiver = replace()];
  return [other, at, tail];
}
