// A TS-instantiated optional method call keeps its receiver when no polyfill entry applies.
// Entry/global modes leave the call intact; pure may erase only an independently proven dead guard.
const box = {
  read<T>(value: T) {
    return [this === box, value];
  }
};
box.read?.<number>(7);