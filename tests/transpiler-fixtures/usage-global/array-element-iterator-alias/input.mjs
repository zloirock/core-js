// A proven symbol alias shares the array plan with a named instance read.
const key = Symbol.iterator;
export function read(receiver) {
  const [{ [key]: iterator, at }] = [receiver];
  return [iterator, at];
}
