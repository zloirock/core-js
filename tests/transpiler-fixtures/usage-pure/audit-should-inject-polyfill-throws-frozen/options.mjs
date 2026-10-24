// frozen Error with readonly `.message` - naive `error.message = ...` would throw a
// secondary TypeError swallowing the real diagnostic. wrapper Error preserves it
export default {
  plugins: [
    ['@core-js', {
      method: 'usage-pure',
      version: '4.0',
      targets: { ie: 11 },
      shouldInjectPolyfill: () => {
        const error = new Error('user callback failed');
        Object.defineProperty(error, 'message', { writable: false });
        throw error;
      },
    }],
  ],
};
