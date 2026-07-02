import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// usage-global mode without explicit `targets`. babel@8 resolves the `[defaults]` browserslist,
// which already supports the iterator suite, so the baseline emits no imports; the unplugin
// no-targets path polyfills everything (see the sidecar). covers no-targets default behavior
Symbol.iterator in obj;