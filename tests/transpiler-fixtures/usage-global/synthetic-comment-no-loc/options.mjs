// inject a synthetic comment without `loc` (mimics what some sibling plugins do) — must
// not crash `parseDisableDirectives`
const injectSyntheticComment = () => ({
  visitor: {
    Program(path) {
      path.hub.file.ast.comments.push({
        type: 'CommentLine',
        value: ' synthetic, no loc',
      });
    },
  },
});

export default {
  plugins: [
    injectSyntheticComment,
    ['@core-js', { method: 'usage-global', version: '4.0', targets: { ie: 11 } }],
  ],
};
