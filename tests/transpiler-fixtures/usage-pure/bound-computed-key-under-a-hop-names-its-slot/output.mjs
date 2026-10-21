import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
{
  const k = 'Map';
  const {
    w: {
      [k]: m
    }
  } = {
    w: _globalThis
  };
  use(m);
}
{
  const k = 'w';
  const [_ref] = [{
    w: [1, 2]
  }];
  const m = _atMaybeArray(_ref.w);
  use(m);
}
{
  const k = 'w';
  const {
    [k]: [_ref2]
  } = {
    w: [[1, 2]]
  };
  const m = _atMaybeArray(_ref2);
  use(m);
}
{
  const k = 'w';
  const {
    [k]: {
      Array: {
        of: m
      }
    }
  } = {
    w: _globalThis
  };
  use(m);
}
{
  const k = 'w';
  const {
    [k]: {
      Map: m
    }
  } = {
    w: _globalThis
  };
  use(m);
}
{
  const k = 'w';
  const {
    [k]: {
      Map: m
    }
  } = {
    w: _globalThis,
    z: other
  };
  use(m);
}
{
  const k = 'w';
  const _ref3 = [1, 2];
  const {
    [k]: {}
  } = {
    ...spread,
    w: _ref3
  };
  const m = _atMaybeArray(_ref3);
  use(m);
}
{
  const k = 'w';
  const m = _atMaybeArray([1, 2]);
  use(m);
}