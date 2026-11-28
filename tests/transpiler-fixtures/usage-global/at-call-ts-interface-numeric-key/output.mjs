import "core-js/modules/es.string.at";
interface Indexed {
  0: string;
  1: number;
}
declare const x: Indexed;
x[0].at(0);