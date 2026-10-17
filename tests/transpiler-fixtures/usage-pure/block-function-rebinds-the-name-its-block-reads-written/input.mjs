export function written(tasks) {
  let C = Set;
  {
    function Promise() {}
    Promise.allSettled = list => list;
    C = Promise;
  }
  return C.allSettled(tasks);
}
