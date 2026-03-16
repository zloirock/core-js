import "core-js/modules/es.array.at";
function f(x: string | number | boolean | string[]) {
  if (typeof x === "string" || typeof x === "number" || typeof x === "boolean") {
    return;
  }
  x.at(-1);
}