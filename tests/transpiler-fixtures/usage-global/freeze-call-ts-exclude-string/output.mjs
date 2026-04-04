import "core-js/modules/es.object.freeze";
function foo(x: Exclude<{
  key: string;
} | string, string>) {
  Object.freeze(x);
}