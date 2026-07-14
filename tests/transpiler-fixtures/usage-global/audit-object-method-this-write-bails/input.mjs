// usage-global twin: a field retyped by an own method (called directly or through an
// extracted value) widens the read, so BOTH families inject per row
const swapped = { data: [3, 4], swap() { this.data = "xy"; } };
swapped.swap();
export const viaMethodWrite = swapped.data.includes(5);

const pulled = { data: [6, 7], flip() { this.data = "z"; } };
const m = pulled.flip;
m.call(pulled);
export const viaExtractedWrite = pulled.data.at(1);
