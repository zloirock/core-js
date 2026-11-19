import _globalThis from "@core-js/pure/actual/global-this";
// A literal wrapper keeps native Map and passthrough reads beside object rest.
// Rest excludes the original w slot.
const rest = [];
{
  const {
    w: {
      Map: m,
      keep
    },
    ...rest
  } = {
    w: _globalThis,
    z: 1
  };
  use(m, keep, rest);
}