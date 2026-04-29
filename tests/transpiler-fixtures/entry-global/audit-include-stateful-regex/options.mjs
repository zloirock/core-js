// stateful regex (`/g`, `/y`) in `include` is normalized so `lastIndex` does not leak
// between matches.
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
