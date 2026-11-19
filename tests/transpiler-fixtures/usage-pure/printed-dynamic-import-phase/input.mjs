// Dynamic import phases survive a printing transform independently of static imports.
export const read = () => import.defer("printer-lazy").then(ns => ns.read([7].at(0)));
export const source = () => import.source("printer.wasm");
