import "core-js/modules/es.array.at";
// a bare global base under a TS non-null assertion (`Array!`) in the extends clause still resolves
// to the global, so the instance-method polyfill is injected as for `extends Array`
class C extends Array! {}
new C().at(0);