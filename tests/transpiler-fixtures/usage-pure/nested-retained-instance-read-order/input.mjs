// A nested declaration keeps each native sibling before the instance read.
// The exported input stays open, so the instance helper must observe the original receiver.
export function read(input) {
  let source = input;
  input.onRead = () => { source = { at: () => 'replacement' }; };
  const { row: { other, at } } = { row: source };
  return [other, at()];
}
