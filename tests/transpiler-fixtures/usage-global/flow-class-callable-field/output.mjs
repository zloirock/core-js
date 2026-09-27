import "core-js/modules/es.string.at";
// @flow
// A function-valued ambient field exposes a signature without a runtime body.
declare class C {
  m: () => string
}
new C().m().at(0);