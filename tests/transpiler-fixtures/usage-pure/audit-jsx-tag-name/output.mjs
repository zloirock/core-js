// JSX identifier visitor checks parent === JSXOpeningElement && parentKey === 'name'.
// `<Map />` passes (runtime ref), `<div map={x}>` has JSXIdentifier 'map' as attribute name
// (not runtime), closing tag repeats `Map` but parentKey !== 'name' - guard skips repeats.
const el = <Map data={x} />;