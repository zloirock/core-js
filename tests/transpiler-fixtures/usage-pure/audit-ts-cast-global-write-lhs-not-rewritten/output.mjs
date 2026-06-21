// usage-pure: a global at an assignment / for-x-head / logical-assign LHS wrapped in a transparent
// expression wrapper must NOT be rewritten to the frozen pure import - the write would TypeError on
// the immutable ESM binding. the write-LHS reject must peel the FULL wrapper set (as / <> /
// satisfies / non-null / nested paren), matching babel-plugin; a peel that only stripped `TSNonNull`
// and paren let casts slip through and over-substituted the global. every wrapper x write-form below;
// all 6 globals rewrite in READ position elsewhere, so the absence of any import here is the assertion
(Map as any) = x;
<any> Set = y;
(Promise satisfies any) ||= z;
WeakMap! += 1;
(WeakSet as any) = w;
for (Symbol as any of arr) {}