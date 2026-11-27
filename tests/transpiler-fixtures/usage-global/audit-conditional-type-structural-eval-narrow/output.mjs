import "core-js/modules/es.array.at";
import "core-js/modules/es.string.includes";
// The selected object member distinguishes the two conditional branches.
type Wrap<T> = T extends string ? {
  foo: string;
} : {
  foo: number[];
};
declare const text: Wrap<string>;
declare const data: Wrap<number>;
text.foo.includes('a');
data.foo.at(0);
export {};