export function wrapped([{ Promise: { all } = Error }] = [globalThis]) {
  return all;
}
