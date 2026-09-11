import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
function foo({
  a,
  ...rest
}: {
  a: number;
  b: string;
}) {
  rest.at(-1);
}