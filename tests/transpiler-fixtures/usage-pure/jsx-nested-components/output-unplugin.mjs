var _ref, _ref2;
import _mapMaybeArray from "@core-js/pure/actual/array/instance/map";
import _entries from "@core-js/pure/actual/instance/entries";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
const el = (
  <ul>
    {_mapMaybeArray(_ref = _entries(items).call(items)).call(_ref, ([i, v]) => (
      <li key={i}>{_padStartMaybeString(_ref2 = v.toString()).call(_ref2, 2, '0')}</li>
    ))}
  </ul>
);