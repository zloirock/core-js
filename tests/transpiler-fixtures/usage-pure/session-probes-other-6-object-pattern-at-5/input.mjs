const arr = [1, 2];
const k = 'k';
{
const { [(k(), 'at')]: s, [(k2(), 'flat')]: f, ...r } = arr; s(r, f);
}
{
const { at: a } = id(arr);
}
