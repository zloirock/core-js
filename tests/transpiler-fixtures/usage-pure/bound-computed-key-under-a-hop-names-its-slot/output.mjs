import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _Map from "@core-js/pure/actual/map";
// a bound computed key names its slot under a hop as on a flat pattern: a mirror lands in the literal's slot
// for a realm constructor, a nested static or a bound leaf key, a sibling beside it included, and an
// instance leaf dispatches off the slot's value - captured where a wrapper or a spread stands beside it. a
// constructor handed to a call takes its whole entry, its key read the same way
{
  const k = 'Map';
  const {
    w: {
      [k]: m
    }
  } = {
    w: {
      Map: _Map
    }
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
    w: {
      Array: {
        of: _Array$of
      }
    }
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
    w: {
      Map: _Map
    }
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
    w: {
      Map: _Map
    },
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