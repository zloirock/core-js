import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.values";
import "core-js/modules/web.dom-collections.values";
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