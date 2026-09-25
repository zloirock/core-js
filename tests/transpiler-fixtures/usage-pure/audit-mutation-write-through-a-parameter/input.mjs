// A parameter's default is spelled by its own function, so a write through the parameter patches
// that constructor and the patched read stays native. What a call passes is not followed: a patch
// routed through an argument is past the static spellings the census covers, and that read keeps
// its pure substitution.
function withDefault(ctor = String) {
  ctor.raw = patched;
}
withDefault();
String.raw(src);

function install(target) {
  target.groupBy = patched;
}
install(Map);
Map.groupBy(src, it => it);
