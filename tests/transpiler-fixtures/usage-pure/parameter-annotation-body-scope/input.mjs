declare function convert(input: number): number[];
function read(value: ReturnType<typeof convert> = 'abc') {
  function convert(input: string) { return input; }
  return value.includes('bc');
}
function rest(...values: ReturnType<typeof convert>[]) {
  function convert(input: string) { return input; }
  return values[0].includes('bc');
}
function object({ value }: { value: ReturnType<typeof convert> } = { value: 'abc' }) {
  function convert(input: string) { return input; }
  return value.includes('bc');
}
function array([value]: ReturnType<typeof convert>[] = ['abc']) {
  function convert(input: string) { return input; }
  return value.includes('bc');
}
read();
rest('abc');
object();
array();
class Box {
  constructor(public value: ReturnType<typeof convert> = 'abc') {
    function convert(input: string) { return input; }
    value.includes('bc');
  }
}
new Box();
