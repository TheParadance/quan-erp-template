import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import terser from '@rollup/plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import { transformSync } from '@swc/core';
import external from '@quan-erp/shared-backend-core/external' with { type: 'json' };

const externals = [...external];
const MODE = process.env.MODE;

/**
 * Fast watch/dev transpile via @swc/core directly.
 * Do NOT use @rollup/plugin-swc here — it drops decorated class fields
 * (`service;`), and PropertyInjectionHelper then never wires @Inject.
 */
const swcDev = () => ({
    name: 'swc-dev',
    transform(code, id) {
        if (!/\.[cm]?[jt]sx?$/.test(id) || id.includes('node_modules')) {
            return null;
        }
        const isTsx = /\.[jt]sx$/.test(id);
        const out = transformSync(code, {
            filename: id,
            sourceMaps: true,
            jsc: {
                parser: {
                    syntax: 'typescript',
                    tsx: isTsx,
                    decorators: true,
                    dynamicImport: true,
                },
                transform: {
                    legacyDecorator: true,
                    decoratorMetadata: true,
                    useDefineForClassFields: true,
                },
                keepClassNames: true,
                target: 'es2022',
            },
            module: {
                type: 'es6',
            },
        });
        return { code: out.code, map: out.map };
    },
});

const sharedPlugins = [
    // NodeNext imports use `.js` suffixes that map to `.ts` sources.
    resolve({
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.json'],
        extensionAlias: {
            '.js': ['.ts', '.tsx', '.js'],
            '.mjs': ['.mts', '.mjs'],
        },
    }),
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
    // SWC transpile only (no typecheck). Run `npm run typecheck` separately if needed.
    dev: {
        input: 'src/index.ts',
        output: {
            format: 'es',
            sourcemap: true,
            file: 'dist/module.js',
            inlineDynamicImports: true,
        },
        plugins: [...sharedPlugins, swcDev()],
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

if (!bundleMode[MODE]) {
    throw new Error(`Unknown or missing MODE="${MODE ?? ''}". Use MODE=prod|dev|export.`);
}

export default bundleMode[MODE];
