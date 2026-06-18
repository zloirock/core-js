import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// ignoreBrowserslistConfig:true with no `targets` - babel@8 falls back to the `[defaults]`
// browserslist (not an empty target set), which already supports Array.from. the babel@8 baseline
// expands the entry to nothing; the unplugin no-targets and babel@7 legs still expand it
export {};