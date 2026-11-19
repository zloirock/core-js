// A source-phase import must remain a module source rather than its evaluated namespace.
import source wasm from "printer.wasm";
export const read = () => [wasm].at(0);
