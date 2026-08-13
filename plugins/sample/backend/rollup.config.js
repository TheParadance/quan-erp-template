import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import external from '@quan-erp/shared-backend-core/external' with { type: 'json' };

const externals = [...external];
const MODE = process.env.MODE;

const sharedPlugins = [
    resolve(),
    commonjs({
        requireReturnsDefault: 'auto',
    }),
    json(),
];

const bundleMode = {
    prod: {
        input: 'src/index.ts',
        output: {
            format: 'es',
            sourcemap: false,
            file: 'dist/module.js',
            inlineDynamicImports: true,
        },
        plugins: [
            ...sharedPlugins,
            typescript(),
            terser({
                keep_classnames: true,
                keep_fnames: true,
                compress: true,
                format: {
                    comments: false,
                },
            }),
        ],
        external: externals,
    },
    dev: {
        input: 'src/index.ts',
        output: {
            format: 'es',
            sourcemap: true,
            file: 'dist/module.js',
            inlineDynamicImports: true,
        },
        plugins: [
            ...sharedPlugins,
            typescript(),
        ],
        external: externals,
    },
    export: {
        input: 'src/index.ts',
        output: {
            file: 'dist/index.js',
            format: 'es',
            sourcemap: false,
        },
        plugins: [
            ...sharedPlugins,
            typescript({
                declaration: true,
                declarationDir: 'dist',
            }),
        ],
        external: externals,
    },
};

export default bundleMode[MODE];
