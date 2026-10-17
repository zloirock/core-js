const rest = [];
{
  const {
    KEY: {
      at: m
    },
    ...rest
  } = {
    w: [1, 2],
    z: 1
  };
  use(m, rest);
}