// JSX identifier visitor checks parent is the JSX opening tag && parentKey === 'name'.
// `<Map />` passes (runtime ref), `<div map={x}>` has the JSX identifier 'map' as attribute
// name (not runtime), closing tag repeats `Map` but parentKey !== 'name' - guard skips repeats.
const el = <Map data={x} />;