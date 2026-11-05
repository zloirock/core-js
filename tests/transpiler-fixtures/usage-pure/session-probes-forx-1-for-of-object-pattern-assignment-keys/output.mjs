// A loop-body destructure reads the slot before the subsequent property write.
// Its literal-wrapper keys read remains native.
{
  for (const _r of [{
    w: Object
  }]) {
    let {
      w: {
        keys
      }
    } = _r;
    _r.w = 1;
    keys;
  }
}