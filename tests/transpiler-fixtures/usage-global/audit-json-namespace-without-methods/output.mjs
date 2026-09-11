import "core-js/modules/es.object.to-string";
import "core-js/modules/es.global-this";
import "core-js/modules/es.json.is-raw-json";
import "core-js/modules/es.json.parse";
import "core-js/modules/es.json.raw-json";
import "core-js/modules/es.json.stringify";
import "core-js/modules/es.json.to-string-tag";
// a VALUE-only usage of a namespace: `globalThis.JSON` read for truthiness names the root and
// injects `es.global-this` alone, while the bare `JSON` value carries no member to narrow on and
// pulls the whole namespace family, `@@toStringTag` included
export const supported = globalThis.JSON ? 'yes' : 'no';
export const escaped = JSON;