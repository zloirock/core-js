---
icon: tool
category: guide
---

# SWC Integration

Fast JavaScript transpiler `swc` [contains integration with Core-JS](https://swc.rs/docs/configuration/supported-browsers), that optimizes work with the global version of Core-JS. [Like `@babel/preset-env`](#babelpreset-env), it has 2 modes: `usage` and `entry`, but `usage` mode still works not so good like in `babel`. Example of configuration in `.swcrc`:

```json
{
  "env": {
    "targets": "> 0.25%, not dead",
    "mode": "entry",
    "coreJs": "3.25"
  }
}
```
