import _at from "@core-js/pure/actual/instance/at";
const arr = [1, 2];
const k = 'k';
{
  const {
      [(k(), 'at')]: s,
      [(k2(), 'flat')]: f,
      ...r
    } = arr,
    q = 2;
  s(r, f, q);
}
{
  const a = _at(id(arr));
}