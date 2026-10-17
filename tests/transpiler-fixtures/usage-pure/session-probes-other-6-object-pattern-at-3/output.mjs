import _at from "@core-js/pure/actual/instance/at";
const arr = [1, 2];
const k = 'k';
{
  const {
    [(k(), 'at')]: s,
    ...r
  } = arr;
  s(r);
}
{
  const a = _at(id(arr));
}