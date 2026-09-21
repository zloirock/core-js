// the usage-pure twin of the sticky-anchor lock: the exclude matches nothing, both reads rewrite
export default {
  plugins: [
    ['@core-js', {
      method: 'usage-pure',
      version: '4.0',
      targets: { ie: 11 },
      exclude: [/array/y],
    }],
  ],
};
