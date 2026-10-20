// A symbol method with arguments keeps the first receiver and its own this value.
// The nested argument claim is visited after rendering the outer invocation.
export function read(get) {
  return get()[Symbol.iterator]([7].at(0));
}
