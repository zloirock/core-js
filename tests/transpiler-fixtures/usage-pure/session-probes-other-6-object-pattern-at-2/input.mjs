const arr = [1, 2];
const k = 'k';
{
const { [(k(), 'at')]: s } = arr; s();
}
{
const { at: a } = id(arr);
}
