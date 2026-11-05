// Nested loop aliases retain the literal wrapper and its native nested static read.
{
  for (const _r of [{
    w: Object
  }]) for (const _s of [_r]) {
    let {
      w: {
        keys
      }
    } = _s;
    keys;
  }
}