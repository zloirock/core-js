const events = [];
const array = [4, 7];
const holder = { get value() { events.push('get'); return array; } };
for (var { value: { at: method } } = { value: (events.push('prefix'), holder.value) }, i = 0; i < 1; i++) {
  use(method.call(array, -1), events);
}
