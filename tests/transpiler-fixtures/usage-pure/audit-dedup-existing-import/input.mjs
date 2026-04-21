// scanExistingCoreJSImports: existing `import _Map from '@core-js/pure/actual/map'` is
// registered as pure import. Subsequent Map reference resolves to this binding, no
// duplicate import added. Demonstrates `onPureImport` dedup path
import _Map from '@core-js/pure/actual/map';
const m = new _Map();
// fresh reference should reuse _Map
const n = new Map();
