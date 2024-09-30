import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';

export default {
  input: 'lib/index.ts', // Entry point of your project
  output: {
    file: 'dist/bundle.js', // Output file
    format: 'cjs', // CommonJS format for Node.js projects
    sourcemap: true, // Generate sourcemaps for easier debugging
  },
  plugins: [
    terser(),
    resolve({preferBuiltins: true}), // Resolve node_modules
    commonjs(), // Convert CommonJS modules to ES6
    typescript(), // Compile TypeScript
    json(), // Support importing JSON files
  ],
  external: ['express', '@aws-sdk/client-cognito-identity-provider'], // External dependencies to not bundle
};
