// usage-global mode without explicit `targets`. babel@8 resolves the `[defaults]` browserslist,
// which already supports the iterator suite, so the baseline emits no imports; the unplugin
// no-targets path polyfills everything (see the sidecar). covers no-targets default behavior
Symbol.iterator in obj;
