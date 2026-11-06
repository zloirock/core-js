// A served optional method owns its receiver comment once.
// The receiver guard and later reads share the value, not the comment.
arr /* receiver */?.flat?.().at(0);
