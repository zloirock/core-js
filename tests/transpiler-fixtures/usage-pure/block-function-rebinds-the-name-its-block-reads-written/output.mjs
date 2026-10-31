import _Set from "@core-js/pure/actual/set/constructor";
export function written(tasks) {
  let C = _Set;
  {
    function Promise() {}
    Promise.allSettled = list => list;
    C = Promise;
  }
  return C.allSettled(tasks);
}