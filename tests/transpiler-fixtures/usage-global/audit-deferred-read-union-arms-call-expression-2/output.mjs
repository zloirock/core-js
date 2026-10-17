import "core-js/modules/es.array.includes";
let shadowedUndefined = null;
const readShadowed = () => shadowedUndefined.includes(1);
{
  let undefined = [1];
  shadowedUndefined = undefined;
}
export const b = readShadowed();