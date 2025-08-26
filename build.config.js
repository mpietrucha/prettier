import { stat, writeFile } from 'fs/promises'
import { join, resolve } from 'path'
import { defineBuildConfig } from 'unbuild'
import { stringify } from 'yaml'

export const declaration = false

export const alias = {
    '@': resolve('src'),
}

const yaml = {
    name: '.prettierrc',
}

export const rollup = {
    inlineDependencies: true,
    output: { exports: 'default' },
}

const hooks = {
    'copy:done': async context => {
        const { name: path, plugins, extension = 'js' } = context.options.yaml

        const { input } = context.options.entries.pop()

        const { default: content } = await import(`${input}.${extension}`)

        const output = join(context.options.outDir, path)

        if (!plugins) {
            content.plugins = undefined
        }

        await writeFile(output, stringify(content))

        const { size: bytes } = await stat(output)

        context.buildEntries.push({ path, bytes })
    },
}

export default defineBuildConfig({ alias, rollup, yaml, declaration, hooks })
