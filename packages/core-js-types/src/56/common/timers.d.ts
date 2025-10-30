type Immediate = object;

declare function setImmediate(handler: (...args: any[]) => void, ...args: any[]): Immediate;
declare function clearImmediate(immediate: Immediate): void;
