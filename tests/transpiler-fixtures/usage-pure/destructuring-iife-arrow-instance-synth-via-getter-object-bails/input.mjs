export const viaGetterObjectBails = (({ flat: fg }) => fg)({ get flat() { return String; } });
