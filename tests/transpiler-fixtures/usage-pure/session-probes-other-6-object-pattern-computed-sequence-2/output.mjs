const k = 'k';
function eff() {
  return Object;
}
{
  const {
    [(k(), 'at')]: s,
    [(k2(), 'flat')]: f
  } = eff();
  s(f);
}