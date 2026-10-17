import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.own-keys";
import "core-js/modules/es.function.name";
const dict = {};
const okKeyRead = (arg => {
  dict[String(arg.name)] = 2;
  return arg;
})(Reflect);
const {
  ownKeys: ok
} = okKeyRead;
export const r5 = ok({
  a: 1
});