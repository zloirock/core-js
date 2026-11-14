// Each optional boundary survives capturing the selected realm and constructor.
export function read(choice) {
  return (choice ? globalThis : null)?.Array?.from([3]);
}
