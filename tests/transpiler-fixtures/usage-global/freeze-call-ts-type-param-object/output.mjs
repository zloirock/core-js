import "core-js/modules/es.object.freeze";
function foo<T extends {
  key: string;
}>(x: T) {
  Object.freeze(x);
}