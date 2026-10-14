import "core-js/modules/es.string.repeat";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.with";
import "core-js/modules/es.number.to-fixed";
// a `!` inside the receiver continues its chain: the live `?.` below the assertion is still the link
// the guard tests, and the receiver past it is read plainly with the assertion kept where the source
// wrote it, so a receiver that comes out nullish there throws at the method read, as the source does
declare const box: {
  list: number[][];
  inner?: {
    list: number[];
  };
} | null;
export const afterLink = box?.list!.flatMap?.(x => x).at(0);
export const beforeLink = box!?.list.flat?.().includes(1);
export const onMethod = box?.inner?.list.findLast!?.(Boolean).toFixed(1);
export const betweenHops = box?.inner!.list.toSorted?.().with(0, 1);