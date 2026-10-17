var $Symbol = typeof Symbol === "function" ? Symbol : {};
var iteratorSymbol = $Symbol.iterator || "@@iterator";
export const runtimeRead = iterable => iterable[iteratorSymbol];
