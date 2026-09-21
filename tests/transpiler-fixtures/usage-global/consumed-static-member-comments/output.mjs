import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// Every comment on a consumed receiver, connector and property survives in source order.
export const result = Array /* receiver */. /* connector */from /* property */(/* argument */[1]);
export const folded = (() => /* inline receiver */Array)()['fr' /* folded key */ + 'om']([1]);
export const keyCall = Array[(() => /* key return */'from')()]([1]);