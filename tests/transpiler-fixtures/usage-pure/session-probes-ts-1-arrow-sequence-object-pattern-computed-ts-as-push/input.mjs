const k = 'k';
const arr = [1, 2];
const log = [];
{
const k = (tag: string) => (log.push(tag), tag); const { [(k as any)('at')]: a } = arr;
}
