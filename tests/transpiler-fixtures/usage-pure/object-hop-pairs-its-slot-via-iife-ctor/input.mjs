const viaIifeCtor = (({ w: { Map: m } }) => m)({ w: globalThis });
export default [viaIifeCtor];
