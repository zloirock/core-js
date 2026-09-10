// `<Map.Provider />` - a JSX member tag. the root `Map` is a runtime reference and is polyfilled as
// the receiver it is, but what the renderer is handed is the MEMBER read, not the root, so the tag
// owes no family for it - the answer its desugared twin `createElement(Map.Provider, props)` already
// gives, and one source may not read two ways. the negative is the BARE tag, on another global so
// its family cannot swallow the evidence above: there the component IS the root the renderer holds
const elem = <Map.Provider value={x}>{children}</Map.Provider>;
const bare = <Set value={x} />;
export { elem, bare };
