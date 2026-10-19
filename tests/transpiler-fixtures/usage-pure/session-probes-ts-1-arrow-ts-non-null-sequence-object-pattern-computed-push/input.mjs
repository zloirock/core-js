const k = 'k';
const arr = [1, 2];
const log = [];
{
// @ts-expect-error a computed key tsc refuses is the shape under test
const k = (tag: string) => (log.push(tag), tag)!; const { [k('at')!]: a } = arr;
}
