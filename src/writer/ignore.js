import isString from 'lodash.isstring'
import trim from 'lodash.trim'
import { minimatch } from 'minimatch'
import { join } from 'path'

export default class Ignore {
    constructor(ignore) {
        ignore && this.add(ignore)

        !ignore && this.useDefaults()
    }

    adapter() {
        return (this.ignore ||= new Set())
    }

    get() {
        return [...this.adapter().values()]
    }

    add(...paths) {
        const add = ignore => this.adapter().add(ignore)

        return paths.flat(Infinity).filter(isString).forEach(add)
    }

    find(path) {
        return this.get().find(ignore => minimatch(path, ignore))
    }

    useDefaults() {
        const defaults = this.defaults()

        this.add(defaults)

        return this
    }

    static defaults() {
        return [this.directory('.git'), this.directory('node_modules')]
    }

    static directory(directory, indicator = '**') {
        if (!directory) {
            return
        }

        return join(indicator, trim(directory, indicator), indicator)
    }
}
