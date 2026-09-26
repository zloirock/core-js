// a sticky RegExp keeps the anchor its flag carried: `/array/y` matches at the start of a module
// name and nowhere else, so it excludes nothing here - stripped to a bare `/array/` it excluded
// every array module
export default {
  plugins: [
    ['@core-js', {
      method: 'usage-global',
      version: '4.0',
      targets: { ie: 11 },
      exclude: [/array/y],
    }],
  ],
};
