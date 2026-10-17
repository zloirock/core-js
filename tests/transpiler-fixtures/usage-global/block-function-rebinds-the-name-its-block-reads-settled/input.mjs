export function settled(items) {
  let C = Array;
  {
    function Reflect() {}
    if (typeof Reflect == 'object') C = Map;
    return C.from(items);
  }
}
