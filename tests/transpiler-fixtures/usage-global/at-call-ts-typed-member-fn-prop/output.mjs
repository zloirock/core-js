import "core-js/modules/es.array.at";
type Processor = {
  process: () => number[];
};
function foo(c: Processor) {
  c.process().at(-1);
}