// The guarded receiver retains deletion and all live key or sibling claims.
export function read(choice) {
  const effects = [];
  return delete (choice ? Object : null).fromEntries?.([]);
}
