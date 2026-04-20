// undefined as the first item - previously `findIndex` would return 0, but `find`
// still returned undefined (matched first item AND the sentinel). fix catches this
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      additionalPackages: [undefined, 'ok'],
    }],
  ],
};
