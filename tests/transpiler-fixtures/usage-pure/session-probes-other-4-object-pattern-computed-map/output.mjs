import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
const k = 'k';
{
  const k = 'z';
  const wrapper = {
    w: _globalThis,
    z: [1, 2]
  };
  {
    const k = 'w';
    const m = _Map;
    use(m);
  }
}