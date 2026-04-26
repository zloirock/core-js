// optional-chain `?.` token appearing inside a string literal must not be mistaken
// for a real chain operator by the rewriter.
var x = "a?.b";
a?.b.at(0);
