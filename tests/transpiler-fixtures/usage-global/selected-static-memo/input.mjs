// Capturing a selected constructor retains candidates without proving either branch.
export function read(choice) {
  return (choice ? Array : null)?.from([3]).at(0);
}
