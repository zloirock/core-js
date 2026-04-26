// labeled statement: the label name itself is a syntactic identifier, not a runtime
// binding, and must not be confused with a global reference.
Map: while (true) {
  break Map;
}
Promise: for (;;) break Promise;