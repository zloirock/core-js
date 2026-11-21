import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
let viaCallback = [1];
[0].forEach(() => {
  viaCallback = 'ab';
});
export const b = viaCallback.at(0);