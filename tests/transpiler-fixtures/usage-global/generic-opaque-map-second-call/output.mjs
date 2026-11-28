import "core-js/modules/es.string.includes";
function twice<T = string>(x: T | null): T {
  return x as any;
}
twice('abc').includes('b');