function eff() {
  return Object;
}
{
  const {
    w: {
      at: m
    },
    z
  } = {
    w: eff() as any,
    z: 1
  } as any;
  use(m, z);
}