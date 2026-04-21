// `toStatelessRegExp` strips `g`/`y` flags to avoid lastIndex persistence between calls.
// a user-supplied `/^es\.array\.at$/g` must still match `es.array.at` consistently
export default {
  plugins: [
    ['@core-js', {
      method: 'entry-global',
      version: '4.0',
      targets: { ie: 11 },
      include: [/^es\.array\.at$/g],
    }],
  ],
};
