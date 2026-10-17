import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.with-resolvers";
// a dynamic-key write may land on ANY slot, so its value reaches every slot read
const cd = {
  d: Object
};
const dyn = 'd';
cd[dyn] = Promise;
const {
  d: {
    withResolvers: viaDynamicKey
  }
} = cd;
export { viaDynamicKey };