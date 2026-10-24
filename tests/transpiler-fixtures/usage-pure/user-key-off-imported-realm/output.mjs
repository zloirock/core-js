import _at from "@core-js/pure/actual/instance/at";
// An imported realm entry holds the same global object. Its unknown slots can contain
// instances, so declarations, assignments and loop heads use generic instance dispatch.
import realm from '@core-js/pure/actual/global-this';
export const declaredAt = _at(realm.y);
let assignedAt;
assignedAt = _at(realm.Y);
for (const _ref of [realm]) {
  const loopAt = _at(_ref.y);
  loopAt;
}
export { assignedAt };