// Both the receiver and its method can short-circuit independently.
export function read(choice) {
  const A = choice ? Array : null;
  return A?.from?.([3]);
}
