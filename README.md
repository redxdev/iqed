# iqed

iqed - the [imquery](https://github.com/redxdev/imquery) editor. Still under development!

iqed uses [electron](http://electron.atom.io) for UI (via [electron-boilerplate](https://github.com/szwacz/electron-boilerplate)) with ffi
bindings to imq (via cimq).

## Requirements

As of right now, you must have imq + cimq built (ideally in release mode) as shared libraries and placed in the root directory of this project.
Depending on your build configuration, you may also need to include the antlr4-runtime library.

## License

Released under the MIT license.