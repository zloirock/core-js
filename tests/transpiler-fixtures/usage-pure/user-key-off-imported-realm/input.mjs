// An imported realm entry holds the same global object. Its unknown slots can contain
// instances, so declarations, assignments and loop heads use generic instance dispatch.
import realm from '@core-js/pure/actual/global-this';
export const { y: { at: declaredAt } } = realm;
let assignedAt;
({ Y: { at: assignedAt } } = realm);
for (const { y: { at: loopAt } } of [realm]) loopAt;
export { assignedAt };
