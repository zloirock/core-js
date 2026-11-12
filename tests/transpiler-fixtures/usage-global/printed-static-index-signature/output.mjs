import "core-js/modules/es.array.at";
// A static index signature describes the constructor rather than instances.
export class Values {
  static readonly [key: string]: number;
}
[7].at(0);