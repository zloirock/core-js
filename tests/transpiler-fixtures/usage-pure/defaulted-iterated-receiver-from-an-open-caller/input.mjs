// An open iterated slot dispatches the supplied receiver; its default stays on the native binding.
export function read(input) {
  const [{ at } = [1]] = input;
  return at.call('ok', 0);
}
export const result = read(['text']);
