declare function getConfig(): unknown;
const config: { name: string } = getConfig();
config.name.at(0);
