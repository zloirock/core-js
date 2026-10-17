const k = 'k';
function eff() {
  return Object;
}
{
  const k = 'w';
  const {
    [k]: {
      at: m
    }
  } = {
    w: eff()
  };
  use(m);
}