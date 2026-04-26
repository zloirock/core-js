// optional-chain `?.` token appearing inside a template-literal expression must not
// be mistaken for a top-level chain operator by the rewriter.
`${a?.b}`.at(0);
