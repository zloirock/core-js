// `new Ctor()` where `Ctor` is an ambient binding with a construct signature resolves to the
// constructor's declared return type, so the instance-method polyfill on the result is injected
declare const Ctor: new () => string[];
new Ctor().at(0);
