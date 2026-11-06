function eff() {
  return Object;
}
function eff2() {}
{
  const [{
    at: m
  }, other] = [eff(), eff2()];
  use(m, other);
}