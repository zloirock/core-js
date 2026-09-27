import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// @flow
// Missing members keep the generic receiver fallback.
declare class C {}
new C().m().at(0);