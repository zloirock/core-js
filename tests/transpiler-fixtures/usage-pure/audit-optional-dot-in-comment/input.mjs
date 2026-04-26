// optional-chain `?.` token appearing inside a comment elsewhere in the source must
// not be mistaken for a real chain operator by the rewriter.
a /* ?. */ ?.b.at(0);
