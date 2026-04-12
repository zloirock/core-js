import _Map from "@core-js/pure/actual/map/constructor";
delete _Map.prototype;
delete (obj.at as any);
delete obj.includes!;