const k = 'k';
const arr = [1, 2];
const log = [];
{
const k = (tag: string): string => (log.push(tag), tag); const { [k('at')]: a } = arr;
}
