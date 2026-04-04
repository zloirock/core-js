import "core-js/modules/es.array.at";
const foo = <T extends number[],>(x: T) => {
  x.at(-1);
};