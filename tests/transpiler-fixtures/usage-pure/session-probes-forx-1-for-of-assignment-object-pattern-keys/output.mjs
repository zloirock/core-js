// A loop head assignment keeps the literal wrapper and its native nested static read.
{
  for (const _r of [{
    w: Object
  }]) {
    ({
      w: {
        keys
      }
    } = _r);
    keys;
  }
}