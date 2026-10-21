// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Reads and effects remain inside their source control-flow positions.
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