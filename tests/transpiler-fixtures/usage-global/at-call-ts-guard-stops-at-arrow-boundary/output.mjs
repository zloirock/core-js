import "core-js/modules/es.string.at";
declare const x: string | number[];
let fn;
if (typeof x === "string") {
  fn = () => x.at(-1);
}