// A preceding statement does not change the loop element literal wrapper policy.
{
  for (const _r of [{
    w: Object
  }]) {
    const x = 1;
    let {
      w: {
        keys
      }
    } = _r;
    keys;
  }
}