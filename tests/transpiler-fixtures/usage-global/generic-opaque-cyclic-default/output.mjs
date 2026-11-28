import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
type Opaque = {
  z: 1;
};
declare const opaque: Opaque;
// @ts-expect-error a cyclic type tsc refuses is the shape under test
function cyc<T = T[]>(x: T | null): T {
  return x as any;
}
// @ts-expect-error the member read is the probe, and the right answer is a type without it
cyc(opaque).at(0);