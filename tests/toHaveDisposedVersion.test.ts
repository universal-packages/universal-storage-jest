import { Storage } from '@universal-packages/storage'
import fs from 'fs'
import stripAnsi from 'strip-ansi'

import '../src'

const file1 = fs.readFileSync('./tests/__fixtures__/test-1.png')
const file2 = fs.readFileSync('./tests/__fixtures__/test-2.png')

describe('toHaveDisposedVersion', (): void => {
  describe('against the exact Storage instance', (): void => {
    it('asserts file being disposed', async (): Promise<void> => {
      const storage = new Storage()

      expect(storage).not.toHaveDisposedVersion('some-key', { width: 100, height: 100, fit: 'cover' })

      const key = await storage.store({ name: 'test-1.png', data: file1 })
      const key2 = await storage.store({ name: 'test-2.png', data: file2 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })
      await storage.storeVersion(key2, { width: 20, height: 20, fit: 'contain' })

      expect(storage).not.toHaveDisposedVersion(key, { width: 100, height: 100, fit: 'cover' })
      expect(storage).not.toHaveDisposedVersion(key2, { width: 20, height: 20, fit: 'contain' })

      await storage.disposeVersion(key, { width: 100, height: 100, fit: 'cover' })

      expect(storage).toHaveDisposedVersion(key, { width: 100, height: 100, fit: 'cover' })
      expect(storage).not.toHaveDisposedVersion(key2, { width: 20, height: 20, fit: 'contain' })

      await storage.dispose(key2)

      expect(storage).toHaveDisposedVersion(key, { width: 100, height: 100, fit: 'cover' })
      expect(storage).toHaveDisposedVersion(key2, { width: 20, height: 20, fit: 'contain' })
    })

    it('fails if key version is disposed and it was not expected to be', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })
      await storage.disposeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(storage).not.toHaveDisposedVersion(key, { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi(`expected Storage instance not to have disposed version "v-100x100-cover" of "${key}" but it did`))
    })

    it('fails if no keys were disposed', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(storage).toHaveDisposedVersion(key, { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi(`expected Storage instance to have disposed version "v-100x100-cover" of "${key}" but it did not dispose any keys at all`))
    })

    it('fails if key was disposed but not by the Storage instance', async (): Promise<void> => {
      const storage = new Storage()
      const otherStorage = new Storage()

      const key2 = await otherStorage.store({ name: 'test-1.png', data: file1 })

      await otherStorage.storeVersion(key2, { width: 100, height: 100, fit: 'cover' })
      await otherStorage.disposeVersion(key2, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(storage).toHaveDisposedVersion(key2, { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected Storage instance to have disposed version "v-100x100-cover" of "${key2}" but it did not dispose any keys at all`)
      )
    })

    it('fails if no versions were disposed fo the key', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })
      const key2 = await storage.store({ name: 'test-2.png', data: file2 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })
      await storage.dispose(key2)

      let error: Error

      try {
        expect(storage).toHaveDisposedVersion(key, { width: 20, height: 20, fit: 'contain' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected Storage instance to have disposed version "v-20x20-contain" of "${key}" but it did not dispose any versions for that key`)
      )
    })

    it('fails if the key version was not disposed', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })
      await storage.disposeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(storage).toHaveDisposedVersion(key, { width: 20, height: 20, fit: 'fill' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected Storage instance to have disposed version "v-20x20-fill" of "${key}" but it did not

Disposed versions were:

"- v-20x20-fill
+ v-100x100-cover"`)
      )
    })
  })

  describe('against the Storage class', (): void => {
    it('asserts file being disposed', async (): Promise<void> => {
      const storage = new Storage()

      expect(Storage).not.toHaveDisposedVersion('some-key', { width: 100, height: 100, fit: 'cover' })

      const key = await storage.store({ name: 'test-1.png', data: file1 })
      const key2 = await storage.store({ name: 'test-2.png', data: file2 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })
      await storage.storeVersion(key2, { width: 20, height: 20, fit: 'contain' })

      expect(Storage).not.toHaveDisposedVersion(key, { width: 100, height: 100, fit: 'cover' })
      expect(Storage).not.toHaveDisposedVersion(key2, { width: 20, height: 20, fit: 'contain' })

      await storage.disposeVersion(key, { width: 100, height: 100, fit: 'cover' })

      expect(Storage).toHaveDisposedVersion(key, { width: 100, height: 100, fit: 'cover' })
      expect(Storage).not.toHaveDisposedVersion(key2, { width: 20, height: 20, fit: 'contain' })

      await storage.dispose(key2)

      expect(Storage).toHaveDisposedVersion(key, { width: 100, height: 100, fit: 'cover' })
      expect(Storage).toHaveDisposedVersion(key2, { width: 20, height: 20, fit: 'contain' })
    })

    it('fails if key version is disposed and it was not expected to be', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })
      await storage.disposeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(Storage).not.toHaveDisposedVersion(key, { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi(`expected version "v-100x100-cover" of "${key}" not to have been disposed but it was`))
    })

    it('fails if no keys were disposed', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(Storage).toHaveDisposedVersion(key, { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi(`expected version "v-100x100-cover" of "${key}" to have been disposed but no files were disposed at all`))
    })

    it('asserts file being disposed does not matter by which instance', async (): Promise<void> => {
      const storage = new Storage()
      const otherStorage = new Storage()

      const key2 = await otherStorage.store({ name: 'test-1.png', data: file1 })

      await otherStorage.storeVersion(key2, { width: 100, height: 100, fit: 'cover' })
      await otherStorage.disposeVersion(key2, { width: 100, height: 100, fit: 'cover' })

      expect(Storage).toHaveDisposedVersion(key2, { width: 100, height: 100, fit: 'cover' })
    })

    it('fails if no versions were disposed fo the key', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })
      const key2 = await storage.store({ name: 'test-2.png', data: file2 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })
      await storage.dispose(key2)

      let error: Error

      try {
        expect(Storage).toHaveDisposedVersion(key, { width: 20, height: 20, fit: 'contain' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected version "v-20x20-contain" of "${key}" to have been disposed but no versions were disposed for that key`)
      )
    })

    it('fails if the key version was not disposed', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })
      await storage.disposeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(Storage).toHaveDisposedVersion(key, { width: 20, height: 20, fit: 'fill' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected version "v-20x20-fill" of "${key}" to have been disposed but it was not

Disposed versions were:

"- v-20x20-fill
+ v-100x100-cover"`)
      )
    })
  })
})
