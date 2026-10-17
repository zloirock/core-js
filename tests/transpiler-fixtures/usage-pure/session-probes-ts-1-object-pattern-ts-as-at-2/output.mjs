function eff() {
  return Object;
}
{
  const {
    at: m,
    z
  } = eff() as any;
  use(m, z);
}