import "core-js/modules/es.math.sign";
let unshadowed;
{
  unshadowed = Math;
}
export const signUnshadowed = () => unshadowed.sign(-2);