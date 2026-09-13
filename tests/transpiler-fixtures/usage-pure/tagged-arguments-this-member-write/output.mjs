import _Reflect from "@core-js/pure/actual/reflect";
// The erased this parameter occupies no invocation slot. The interpolation reaches
// the namespace parameter, whose named write keeps it local and gates the static read.
// Pure carries the patched static through its substituted namespace.
function install(this: void, strings: TemplateStringsArray, namespace: any) {
  namespace.ownKeys = patched;
}
install`${_Reflect}`;
_Reflect.ownKeys({});