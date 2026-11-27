// The method inside the initializer must be visited.
enum E {
  A = (1 + 2),
  Extra = ([7].includes(7) ? 1 : 0),
  B = (3 + 4),
}
const arr: number[] = [E.A, E.B];
arr.at(0);
