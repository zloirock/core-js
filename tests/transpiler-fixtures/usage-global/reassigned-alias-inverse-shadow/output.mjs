// A function-scoped holder is declared under an inner source binding, then
// assigned outside that block. The later write sees the outer custom method;
// the unused inner Array source must not cause Array.from injection.
export function read() {
  const source = {
    x: {
      from: () => ['outer']
    }
  };
  {
    const source = {
      x: Array
    };
    var holder = 0;
  }
  holder = source;
  const {
    x: {
      from
    }
  } = holder;
  return from([]);
}