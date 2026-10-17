{
const r = (({ w: [{ hasOwn }] }) => hasOwn)({ get w() { return [Object]; } });
}
