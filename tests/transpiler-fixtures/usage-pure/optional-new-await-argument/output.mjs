import _at from "@core-js/pure/actual/instance/at";
// The optional call returns the constructor; await inside it remains lowerable.
export async function read(arr) {
  return new (_at(arr)?.call(arr, await 0))(7);
}