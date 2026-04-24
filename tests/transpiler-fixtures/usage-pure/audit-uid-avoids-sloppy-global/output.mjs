import _Map2 from "@core-js/pure/actual/map/constructor";
// sloppy-mode `_Map = ...` is an assignment to an undeclared name, creating a global at
// runtime. plugin's generated ref name must avoid this collision: if the Map polyfill
// import landed as `import _Map from ...`, it would clash with the user's global assignment
// on the same `_Map` identifier. plugin allocates `_Map2` instead, leaving the user's
// sloppy global untouched
_Map = {
  custom: true
};
new _Map2();