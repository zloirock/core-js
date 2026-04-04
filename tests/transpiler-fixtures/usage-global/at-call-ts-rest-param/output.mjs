import "core-js/modules/es.array.at";
function foo(...args: number[][]) {
  args.at(-1);
}