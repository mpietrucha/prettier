import Config from '@/config'
import Cache from '@writer/cache'
import Ignore from '@writer/ignore'
import { existsSync } from 'fs'
import { readFile, writeFile } from 'fs/promises'
import { glob } from 'glob'
import { hash } from 'hasha'
import isValidPath from 'is-valid-path'
import noop from 'lodash.noop'
import { format } from 'prettier'

export default class Writer {
    constructor({ cache, ignore, cwd } = {}) {
        this.options = { cwd }

        this.config = new Config()

        this.ignore = new Ignore(ignore)

        this.cache = new Cache(cache, () => {
            this.throwInvalidCacheDirectoryError()
        })

        this.ignore.add(Ignore.directory(this.cache.directory()))
    }

    ignored() {
        return this.ignore.get()
    }

    async hash(content) {
        return await hash(content, { algorithm: 'md5' })
    }

    async read(file) {
        if (!existsSync(file)) {
            return
        }

        if (this.ignore.find(file)) {
            return
        }

        const content = await readFile(file, 'utf8')

        const cache = await this.cache.get(file)

        const hash = cache && (await this.hash(content))

        if (cache && cache === hash) {
            return
        }

        return content
    }

    async save(file, content) {
        await writeFile(file, content)

        await this.cache.set(file, await this.hash(content))

        return file
    }

    async all(config = {}) {
        const write = this.write.bind(this)

        const files = await glob('**/**', {
            nodir: true,
            cwd: this.cwd,
            absolute: true,
            ignore: this.ignored(),
        })

        const pending = files.map(write)

        return await Promise.all(pending).then(done => {
            return files.filter((file, i) => done.at(i))
        })
    }

    async write(file, config = {}) {
        const source = await this.read(file)

        if (!source) {
            return
        }

        const configuration = await this.config.get({ config })

        const content = await format(source, {
            filepath: file,
            ...configuration,
        }).catch(noop)

        content && (await this.save(file, content))

        return !!content
    }

    get cwd() {
        const { cwd = process.cwd() } = this.options

        if (isValidPath(cwd)) {
            return cwd
        }

        this.throwInvalidCwdError(cwd)
    }

    throwInvalidCwdError(cwd, message) {
        message ||= 'Writer `options.cwd` must be valid path.'

        throw new Error(message)
    }

    throwInvalidCacheDirectoryError(directory, message) {
        message ||= 'Writer `options.cache` must be valid path or configuration object.'

        throw new Error(message)
    }
}
