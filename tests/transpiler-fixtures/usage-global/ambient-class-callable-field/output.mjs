import "core-js/modules/es.string.at";
// A declared callable field has a signature but no initializer to escape.
declare class C {
  m: () => string;
}
new C().m().at(0);