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
  // @ts-expect-error the member read is the probe, and the right answer is a type without it
  rest.at(-1);
}