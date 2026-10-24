import "core-js/modules/es.object.is-extensible";
import "core-js/modules/es.reflect.namespace";
let inPlace = null;
inPlace = Reflect;
inPlace = Object;
export const placeRead = inPlace.isExtensible(1);