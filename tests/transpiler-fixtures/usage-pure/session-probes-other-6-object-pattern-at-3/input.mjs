const arr = [1, 2];
const k = 'k';
{
const { [(k(), 'at')]: s, ...r } = arr; s(r);
}
{
const { at: a } = id(arr);
}
