import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-end";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.flat-map";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.array.unscopables.flat-map";
import "core-js/modules/es.array.with";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.number.to-exponential";
import "core-js/modules/es.number.to-fixed";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.dom-collections.iterator";
// A `!` between two links above a claim hides nothing from usage detection: the claims below the
// assertion, the dispatches whose optional call re-opens the chain and two optional dispatches
// joined into one guard pull their modules as they would without it, a `?.` after it included.
declare const nums: number[] | null;
declare const strs: string[] | null;
declare const lists: any[] | null;
nums?.at(-1).toFixed(2)!.length;
nums?.findLastIndex(Boolean).toExponential(1).toString()!!.length;
lists?.[0].flat?.()!.length;
lists?.[0].includes?.(1)!.valueOf();
lists?.[1].flatMap?.(x => [x]).toSorted?.()!.length;
lists?.with?.(0, 2).toReversed?.()!.length;
strs?.findLast(Boolean).padEnd(2)!?.toString();