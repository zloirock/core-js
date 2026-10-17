import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.aggregate-error.constructor";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.reject";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.promise.any";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.promise.all-keyed";
import "core-js/modules/esnext.promise.all-settled-keyed";
import "core-js/modules/web.dom-collections.iterator";
// A member write through a binding lands in every container the binding may hold: up to 64 containers it is
// filed under each of them, past that once for all, and a read of that slot through any container finds it
// either way. Each rest below reads a constructor out of such a slot through another literal and pulls the
// family written there - on both sides of the ceiling, each side under a key of its own.
let laidOut, filedOnce;
// 64 containers, eight rows of eight
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {}, laidOut = {};
// 65 containers: the same eight rows and one more
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {}, filedOnce = {};
filedOnce = {};
laidOut.ctor = Map;
filedOnce.slot = Promise;
const viaLaidOut = {
    held: laidOut
  },
  viaFiledOnce = {
    held: filedOnce
  };
const {
  groupBy,
  ...mapRest
} = viaLaidOut.held.ctor;
const {
  withResolvers,
  ...promiseRest
} = viaFiledOnce.held.slot;
export const r = [groupBy, mapRest, withResolvers, promiseRest];