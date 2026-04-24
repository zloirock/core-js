// existing `import _Map from '@core-js/pure/actual/map'` is recognised as a
// `Map` reference (so `new _Map()` stays as is), while a bare `new Map()` on
// the next line still gets its own canonical import from the constructor entry
import _Map from '@core-js/pure/actual/map';
const m = new _Map();
// fresh `Map` reference - gets its own import
const n = new Map();
