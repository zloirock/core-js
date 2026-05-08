// `Array.isArray?.(input)` (optional call) inside the guard must still narrow
// `input` to an array on the success branch, so `input.at(0)` dispatches array-aware
function take(input: unknown) {
  if (Array.isArray?.(input)) {
    return input.at(0);
  }
  return null;
}
