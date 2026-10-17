const arr = [1, 2];
const k = 'k';
{
const { [(k(), 'at')]: s, [(k2(), 'flat')]: f, z } = arr; s(z, f);
}
{
const { at: a } = id(arr);
}
