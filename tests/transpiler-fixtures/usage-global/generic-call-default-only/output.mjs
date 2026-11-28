import "core-js/modules/es.array.at";
function defaultsOnly<U = string[]>(): U {
  return [] as any;
}
defaultsOnly().at(0);