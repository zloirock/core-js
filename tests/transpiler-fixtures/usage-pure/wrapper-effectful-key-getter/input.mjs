// A caller-supplied receiver keeps its getter between the computed key and the sibling write.
export function read(input, log) {
  function mark(tag, value) { log.push(tag); return value; }
  let at, tail;
  [{ [(mark('key'), 'at')]: at }, tail] = [mark('receiver', input), 7];
  return [at, tail];
}
