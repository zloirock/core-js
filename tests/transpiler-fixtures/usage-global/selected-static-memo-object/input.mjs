// A selected Object constructor uses its static; a custom receiver retains its own method.
export function read(choice, custom) {
  return (choice ? Object : custom)?.entries({ x: 3 }).at(0);
}
