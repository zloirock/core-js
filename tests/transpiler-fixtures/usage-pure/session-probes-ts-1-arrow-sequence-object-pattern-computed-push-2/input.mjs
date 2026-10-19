const k = 'k';
const arr = [1, 2];
const log = [];
{
// @ts-expect-error a computed key tsc refuses is the shape under test
const k = <T,>(tag: T): T => (log.push(String(tag)), tag); const { [k<string>('at')]: a } = arr;
}
