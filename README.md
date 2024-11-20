# `pandoc-wasm`

[![Chat on Matrix](https://matrix.to/img/matrix-badge.svg)](https://matrix.to/#/#haskell-wasm:matrix.terrorjack.com)

The latest version of `pandoc` CLI compiled as a standalone
`wasm32-wasi` module that can be run by engines like `wasmtime` as
well as browsers.

## [Live demo](https://tweag.github.io/pandoc-wasm)

Stdin on the left, stdout on the right, command line arguments at the
bottom. No convert button, output is produced dynamically as input
changes.

You're also more than welcome to fetch the
[`pandoc.wasm`](https://tweag.github.io/pandoc-wasm/pandoc.wasm)
module and make your own customized app. `pandoc.wasm` is fully
`wasm32-wasi` compliant and doesn't make use of any JSFFI feature in
the ghc wasm backend.

## Building

`pandoc.wasm` is built with 9.12 flavour of ghc wasm backend in CI,
which can be installed via
[`ghc-wasm-meta`](https://gitlab.haskell.org/ghc/ghc-wasm-meta). You
need at least 9.10 since it's the earliest major version with (my
non-official) backports for ghc wasm backend's Template Haskell & ghci
support.

It's built using my
[fork](https://github.com/haskell-wasm/pandoc/tree/wasm) which is
based on latest `pandoc` release and patches dependencies, cabal
config as well as some module code to make things compilable to wasm:

- No http client/server functionality. `wasip1` doesn't have proper
  sockets support anyway, and support for future versions of wasi is
  not on my radar for now.
- No lua support. lua requires `setjmp`/`longjmp` which already work
  in `wasi-libc` to some extent, but that requires wasm exception
  handling feature which is not supported by `wasmtime` yet.

Other functionalities should just work, if not feel free to file a bug
report :)

## Acknowledgements

Thanks to John MacFarlane and all the contributors who made `pandoc`
possible: a fantastic tool that has benefited many developers and is a
source of pride for the Haskell community!

Thanks to all past efforts of using `asterius` to compile `pandoc` to
wasm, including but not limited to:

- George Stagg's [`pandoc-wasm`](https://github.com/georgestagg/pandoc-wasm)
- Yuto Takahashi's [`wasm-pandoc`](https://github.com/y-taka-23/wasm-pandoc)
- My legacy asterius pandoc [demo](https://asterius.netlify.app/demo/pandoc/pandoc.html)
