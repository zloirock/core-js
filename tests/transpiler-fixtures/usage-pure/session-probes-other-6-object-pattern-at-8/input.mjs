const arr = [1, 2];
const k = 'k';
{
const { [(k(), 'at')]: s, z } = arr; s(z);
}
{
const { at: a } = id(arr);
}
