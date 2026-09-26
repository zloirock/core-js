// Repeated instance keys require independent getter reads, so this default stays native.
export function read({
  at,
  at: other
} = [7]) {
  return [at, other];
}