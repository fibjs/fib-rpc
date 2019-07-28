const path = require('path');
const builtinModules = require('@fibjs/builtin-modules')

const { default: rollup, plugins } = require('fib-rollup')

const commonjs = require('rollup-plugin-commonjs');

const pkg = require('./package.json')
const internalModules = builtinModules.concat([
    'module'
])

const compression = process.env.COMPRESS

// yes, just use top-level await!
// get rollup instance `bundle`
const bundle = await rollup.rollup({
    input: path.resolve(__dirname, './lib/index.js'),
    external: internalModules.concat(pkg['rollup.internal'] || []),
    plugins: [
        plugins['rollup-plugin-fibjs-resolve'](),
        commonjs(),
        compression && plugins['rollup-plugin-uglify-es']()
    ].filter(x => x)
}).catch(e => console.error(e.stack));

// write bundled result with `bundle.write`
await bundle.write({
    file: path.resolve(__dirname, `./dist/index${compression ? '.min' : ''}.js`),
    format: 'cjs'
}).catch(e => console.error(e));