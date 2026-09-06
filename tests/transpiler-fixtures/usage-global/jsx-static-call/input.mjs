// A JSX spread attribute is the object-spread shape written in another dialect: it lowers to the
// same helper and owes the same modules, beside whatever the expressions inside it claim on their
// own. The two sources are independent - the calls here would inject nothing for the spread.
const el = <div {...Object.assign({}, props)} data-keys={Object.keys(props)} />;
