import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// inner block redeclares `Array`: inside the block the local binding wins and the call is
// left alone; outer `Array.from(...)` still polyfills. the inner method DIFFERS from the
// outer one - a broken shadow skip would inject `es.array.of`, which the outer line cannot
// mask (same-method inner would hide the leak inside the deduplicated import set)
{
  const Array = [1, 2, 3];
  Array.of(4, 5);
}
Array.from([1, 2]);