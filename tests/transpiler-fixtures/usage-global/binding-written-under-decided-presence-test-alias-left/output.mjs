import "core-js/modules/es.string.repeat";
import "core-js/modules/es.string.pad-start";
const config = APP_CONFIG;
export function aliasLeft() {
  let value = [1];
  config || (value = 'abc');
  return value.padStart(4);
}