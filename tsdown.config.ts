import { defineConfig } from 'tsdown/config';

export default defineConfig({
  entry: ['./src/index.ts', './src/connectrpc.ts'],
  format: 'esm',
  target: 'node16',
  clean: true,
  platform: 'node',
  skipNodeModulesBundle: true,
  dts: { transformer: 'oxc' },
  bundleDts: true,
  unused: { level: 'error' },
  publint: true,
  sourcemap: true,
  outputOptions: {
    chunkFileNames: '[name].js',
  },
  onSuccess() {
    console.info('🙏 Build succeeded!');
  },
});
