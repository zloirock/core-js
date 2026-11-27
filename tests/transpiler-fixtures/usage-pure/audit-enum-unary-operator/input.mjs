// The method inside the initializer must be visited.
enum E {
  A = +1,
  Extra = +[7].includes(7),
  B = -2,
  C = ~3,
}
const arr: number[] = [E.A, E.B, E.C];
arr.at(0);
