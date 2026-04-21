// BOM + composed nested polyfill. plugin strips BOM before MagicString so queue
// offsets must not drift. compose loop inserts nested polyfill into outer content
Array.from(Array.from(x));
