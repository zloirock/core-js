import "core-js/modules/es.array.at";
type Inner = {
  values: number[];
};
type Outer = Inner & {
  label: string;
};
declare const obj: {
  meta: string;
} & Outer;
obj.values.at(0);