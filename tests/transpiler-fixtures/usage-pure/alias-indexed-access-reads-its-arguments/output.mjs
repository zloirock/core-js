import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findMaybeArray from "@core-js/pure/actual/array/instance/find";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// an alias whose body indexes its parameter reads the argument it was instantiated with: the
// `keyof` fold of `ValueOf<Config>` is the union of Config's values, a literal key reads that one
// member, and an alias handing its parameter on to another one keeps the argument
interface Config {
  hosts: string[];
  ports: string[];
}
type ValueOf<T> = T[keyof T];
type Get<T, K extends keyof T> = T[K];
type Values<T> = ValueOf<T>;
export function first(value: ValueOf<Config>) {
  return _atMaybeArray(value).call(value, 0);
}
export function hasHost(hosts: Get<Config, 'hosts'>) {
  return _includesMaybeArray(hosts).call(hosts, 'a');
}
export function firstTruthy(value: Values<Config>) {
  return _findMaybeArray(value).call(value, Boolean);
}