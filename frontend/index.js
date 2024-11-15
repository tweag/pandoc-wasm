import {
  WASI,
  OpenFile,
  File,
  ConsoleStdout,
} from "https://cdn.jsdelivr.net/npm/@bjorn3/browser_wasi_shim@0.3.0/dist/index.js";

const mod = await WebAssembly.compileStreaming(fetch("./pandoc.wasm"));

const instance_promise_pool_size = 8;

const instance_promise_pool = [];

function instance_promise_pool_fill() {
  if (instance_promise_pool.length < instance_promise_pool_size) {
    for (
      let i = instance_promise_pool.length;
      i < instance_promise_pool_size;
      ++i
    ) {
      const args = [];
      const env = [];
      const stdin_file = new File(new Uint8Array(), { readonly: true });
      const stdout_file = new File(new Uint8Array(), { readonly: false });
      const fds = [
        new OpenFile(stdin_file),
        new OpenFile(stdout_file),
        ConsoleStdout.lineBuffered((msg) =>
          console.warn(`[WASI stderr] ${msg}`)
        ),
      ];
      const options = { debug: false };
      const wasi = new WASI(args, env, fds, options);
      instance_promise_pool.push(
        WebAssembly.instantiate(mod, {
          wasi_snapshot_preview1: wasi.wasiImport,
        }).then((instance) => ({ instance, wasi, stdin_file, stdout_file }))
      );
    }
  }
}

instance_promise_pool_fill();

const instances = (async function* () {
  while (true) {
    yield await instance_promise_pool.shift();
    instance_promise_pool_fill();
  }
})();

export async function run_pandoc(args, stdin_str) {
  const { instance, wasi, stdin_file, stdout_file } = (await instances.next())
    .value;
  wasi.args = ["pandoc.wasm", ...args];
  stdin_file.data = new TextEncoder().encode(stdin_str);
  const ec = wasi.start(instance);
  if (ec !== 0) {
    throw new Error(`Non-zero exit code ${ec}`);
  }
  return new TextDecoder("utf-8", { fatal: true }).decode(stdout_file.data);
}
