import "core-js/modules/es.array.at";
// calling a function-valued index signature through a dynamic computed key (`d[key]()`) yields the
// function's RETURN type, so the instance-method polyfill on the result is injected
declare const d: {
  [k: string]: () => number[];
};
declare const key: string;
d[key]().at(0);