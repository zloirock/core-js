// Literal spreads preserve native static and neighbouring data reads across sibling declarators.
const arr = [1, 2];
const nb = {
  y: arr
};
{
  const [{
      from: f
    }] = [...[Array]],
    [{
      z
    }] = [...[nb]];
}