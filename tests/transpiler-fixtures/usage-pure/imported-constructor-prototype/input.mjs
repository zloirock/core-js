// An imported constructor keeps its prototype even when its local name matches the global.
import Map from "@core-js/pure/actual/map";
export const has = Map.prototype.has;
