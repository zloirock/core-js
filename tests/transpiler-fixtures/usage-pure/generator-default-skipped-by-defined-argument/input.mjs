class Box {
  *values<T>(x: T, update = (x = JSON.parse('[37]'))) { yield x; }
}
export function read() {
  for (const value of new Box().values('ab', 'keep')) return value.at(0);
}
