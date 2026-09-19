// Object-rest keeps the affected loop pattern native at its original evaluation point.
// Independent reads and key/default expressions still receive their own polyfills.
const seen = [];
for (var { from, ...staticRest } of [Array]) seen.push(typeof from, 'from' in staticRest);

for (var { at, ...instanceRest } of [[1, 2]]) seen.push(typeof at, 'at' in instanceRest);
export { seen };
