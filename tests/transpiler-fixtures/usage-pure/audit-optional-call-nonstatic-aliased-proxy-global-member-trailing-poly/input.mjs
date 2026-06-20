// proxy-global accessed through an ALIAS binding (`const g = globalThis; g.Map`): the static still
// collapses to its pure ctor (`g.Map` -> `_Map`) because the binding follows to a proxy-global, while
// the alias assignment keeps the leaf swap (`g = _globalThis`). leaving `g.Map` reads the absent native
// Map on engines without it. distinct trailing methods so each line's import is unambiguous
const g = globalThis;
const r = g.Map.notAMethod?.().flat().at(0);
