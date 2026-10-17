import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.apply";
import "core-js/modules/es.reflect.construct";
import "core-js/modules/es.reflect.define-property";
import "core-js/modules/es.reflect.delete-property";
import "core-js/modules/es.reflect.get";
import "core-js/modules/es.reflect.get-own-property-descriptor";
import "core-js/modules/es.reflect.get-prototype-of";
import "core-js/modules/es.reflect.has";
import "core-js/modules/es.reflect.is-extensible";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.reflect.prevent-extensions";
import "core-js/modules/es.reflect.set";
import "core-js/modules/es.reflect.set-prototype-of";
import "core-js/modules/es.reflect.to-string-tag";
// a namespace handed OUT owes its family exactly as an escaped constructor does: the holder reads
// statics off it, and the bare object entry installs none - every one of them answers `undefined` on
// the floor this build targets. the widen reads BOTH narrow spellings, and a namespace global names
// its bare object `<x>/namespace` where a constructor names its binding `<x>/constructor`; asking
// only for the second shipped the stub. `Reflect` is the one namespace this build gives an entry
export const escaped = Reflect;