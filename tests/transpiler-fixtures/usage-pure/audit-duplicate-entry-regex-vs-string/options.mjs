// regex include vs string exclude on the same module path - NOT flagged as duplicate.
// duplicate check compares identical representations only; a RegExp with the same
// effective source as a string form is not considered a duplicate (by design)
export default {
  plugins: [
    ['@core-js', {
      method: 'usage-pure',
      version: '4.0',
      include: [/^es\.array\.from$/],
      exclude: ['es.array.from'],
      targets: { ie: 11 },
    }],
  ],
};
