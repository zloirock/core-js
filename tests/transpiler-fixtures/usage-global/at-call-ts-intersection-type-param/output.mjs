import "core-js/modules/es.array.at";
function foo(x: number[] & {
  extra: boolean;
}) {
  x.at(-1);
}