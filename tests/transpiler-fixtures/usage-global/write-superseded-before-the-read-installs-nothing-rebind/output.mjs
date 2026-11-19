import "core-js/modules/es.reflect.namespace";
import "core-js/modules/es.reflect.has";
let rebound = null;
export function rebind() {
  rebound = Reflect;
  rebound = Object;
  return () => rebound.has({}, 'x');
}