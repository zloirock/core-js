import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// an undecided conditional type folds both branches like union arms: a branch the resolver cannot
// resolve - a cross-module type - may be the runtime shape, so it sinks the fold and the generic
// helper dispatches, never the other branch as certain. a nullish branch still strips (the second
// conditional resolves to its string branch)
import type { Rows } from './rows';
interface MyList {
  [Symbol.iterator](): Iterator<number[]>;
}
type Pick1<T> = T extends Iterable<unknown> ? Rows : string;
type Pick2<T> = T extends Iterable<unknown> ? null : string;
declare const p: Pick1<MyList>;
declare const q: Pick2<MyList>;
export const a = p.at(0);
export const b = q.includes('a');