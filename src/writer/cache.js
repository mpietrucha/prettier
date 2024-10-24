import { Cache as Adapter } from 'file-system-cache'
import isValidPath from 'is-valid-path'
import isObject from 'lodash.isobject'
import { dirname, resolve } from 'path'

export default class Cache {
    constructor(cache, failed) {
        this.failed = failed

        this.bootstrap(cache)
    }

    adapter() {
        return this.cache
    }

    set(key, value) {
        return this.adapter().set(key, value)
    }

    get(key) {
        return this.adapter().get(key)
    }

    directory() {
        return this.base
    }

    bootstrap(cache) {
        if (this.cache) {
            return
        }

        if (!isObject(cache)) {
            return this.bootstrap({ directory: cache })
        }

        const { directory = this.default(), ...options } = cache

        if (directory === false) {
            this.cache = new Map()

            return
        }

        this.assert(directory)

        this.base = directory

        this.cache = new Adapter({
            ...options,
            basePath: directory,
        })
    }

    default(directory = '.cache') {
        const local = dirname(import.meta.dirname)

        return resolve(local, directory)
    }

    assert(directory) {
        if (isValidPath(directory)) {
            return
        }

        this.failed?.(directory)

        throw new Error('Directory must be valid path.')
    }
}
