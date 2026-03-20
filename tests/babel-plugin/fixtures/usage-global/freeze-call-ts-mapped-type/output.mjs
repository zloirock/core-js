import "core-js/modules/es.object.freeze";
function foo<T>(x: { [K in keyof T]: string }) {
  Object.freeze(x);
}