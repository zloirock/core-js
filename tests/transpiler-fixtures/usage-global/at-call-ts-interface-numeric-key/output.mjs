import "core-js/modules/es.string.at";
interface Indexed {
  0: string;
  1: number;
}
const x: Indexed = {
  0: "hello",
  1: 42
};
x[0].at(0);