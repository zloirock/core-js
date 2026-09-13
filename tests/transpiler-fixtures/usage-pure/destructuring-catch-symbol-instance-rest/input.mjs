// Object-rest keeps the affected catch pattern native, including its named method slots.
// Independent reads and key/default expressions still receive their own polyfills.
try {} catch ({ [Symbol.iterator]: iter, includes, ...rest }) { iter(); includes("x"); }
