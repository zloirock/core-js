// A var in a nested block still supplies the IIFE's receiver.
export function read() {
  { var Arr = Array; }
  return (({ from } = Object) => from)(Arr);
}
