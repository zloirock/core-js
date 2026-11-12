/*@jsx h*/
import "core-js/modules/es.array.includes";
/** @jsx h
 * The file pragma and the next-line opt-out keep their separate owners.
 * core-js-disable-next-line
 */
export const untouched = [1].at(0);
export const view = <box>{[1].includes(1)}</box>;