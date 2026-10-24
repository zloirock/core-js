// usage-global: type-only export must not inject `core-js/modules/es.set.constructor`
// (the `type` modifier strips runtime binding, Set here is a TS type alias not the global)
type Set = string;
export { type Set };
