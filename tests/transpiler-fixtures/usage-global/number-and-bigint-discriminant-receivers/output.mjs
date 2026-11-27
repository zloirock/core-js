import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// Numeric and BigInt tags select different receiver families.
type Wide = {
  tag: 2;
  items: number[];
} | {
  tag: 2n;
  items: string;
};
declare const wide: Wide;
if (wide.tag === 2) wide.items.at(0);
if (wide.tag === 2n) wide.items.includes('x');