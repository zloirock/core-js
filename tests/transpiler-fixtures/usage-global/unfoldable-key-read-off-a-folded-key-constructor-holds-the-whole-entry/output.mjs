import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.join";
import "core-js/modules/es.array.values";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.iterator.zip";
import "core-js/modules/es.iterator.zip-keyed";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.from-code-point";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
import "core-js/modules/web.url.constructor";
import "core-js/modules/web.url.can-parse";
import "core-js/modules/web.url.parse";
import "core-js/modules/web.url.to-json";
import "core-js/modules/web.url-search-params.constructor";
import "core-js/modules/web.url-search-params.delete";
import "core-js/modules/web.url-search-params.has";
import "core-js/modules/web.url-search-params.size";
// a read by a key no fold names, off a constructor taken through a computed key the claim folds - an effect ahead
// of the name, a const binding, a concat - may read any of its statics and loads the whole family, as off the
// plainly keyed constructor. a named static read off such a constructor loads that static alone
let k = 0;
const K = 'Map';
const {
  [(k++, 'Iterator')]: ViaEffect
} = globalThis;
export const fromEffect = ViaEffect[['fr', 'om'].join('')]([1].values()).toArray();
const ViaBound = globalThis[K];
export const fromBound = ViaBound[['group', 'By'].join('')]([1], x => x).get(1);
const {
  ['U' + 'RL']: ViaConcat
} = self;
export const fromConcat = ViaConcat[['can', 'Parse'].join('')]('a:b');
const {
  [(k++, 'Promise')]: Named
} = globalThis;
export const settled = Named.allSettled([]);