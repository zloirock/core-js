import "core-js/modules/es.array.of";
// an own-static shadow and an instance method inject nothing; a `this` param-default
// injects like the declarator form
class ParamDefault extends Array {
  static m({
    of
  } = this) {
    return of;
  }
}
export const viaParam = ParamDefault.m();