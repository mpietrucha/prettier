import { resolve } from 'path'
import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
    declaration: false,
    alias: {
        '~': __dirname,
        '@': resolve(__dirname, 'src'),
        '@writer': resolve(__dirname, 'src/writer'),
    },
    rollup: {
        inlineDependencies: true,
    },
})
