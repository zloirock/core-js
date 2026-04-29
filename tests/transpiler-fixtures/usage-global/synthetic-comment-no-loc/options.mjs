// sibling plugins occasionally inject comments without `loc`. The plugin must tolerate
// that when scanning for disable directives.
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
