import { Storage } from '@universal-packages/storage'
import fs from 'fs'
import stripAnsi from 'strip-ansi'

import '../src'

const file1 = fs.readFileSync('./tests/__fixtures__/test-1.png')
const file2 = fs.readFileSync('./tests/__fixtures__/test-2.png')

describe('toHaveDisposed', (): void => {
  describe('against the exact Storage instance', (): void => {
    it('asserts key being disposed', async (): Promise<void> => {
      const storage = new Storage()

      expect(storage).not.toHaveDisposed('some-key')

      const key = await storage.store({ name: 'test-1.png', data: file1 })
      const key2 = await storage.store({ name: 'test-2.png', data: file2 })

      expect(storage).not.toHaveDisposed(key)
      expect(storage).not.toHaveDisposed(key2)

      await storage.dispose(key)

      expect(storage).toHaveDisposed(key)
      expect(storage).not.toHaveDisposed(key2)

      await storage.dispose(key2)

      expect(storage).toHaveDisposed(key)
      expect(storage).toHaveDisposed(key2)
    })

    it('fails if key is disposed and it was not expected to be', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.dispose(key)

      let error: Error

      try {
        expect(storage).not.toHaveDisposed(key)
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi(`expected Storage instance not to have disposed "${key}" but it did`))
    })

    it('fails if no keys were disposed', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      let error: Error

      try {
        expect(storage).toHaveDisposed(key)
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi(`expected Storage instance to have disposed "${key}" but it did not dispose any keys at all`))
    })

    it('fails if key was disposed but not by the Storage instance', async (): Promise<void> => {
      const storage = new Storage()
      const otherStorage = new Storage()

      const key2 = await otherStorage.store({ name: 'test-1.png', data: file1 })

      await otherStorage.dispose(key2)

      let error: Error

      try {
        expect(storage).toHaveDisposed(key2)
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi(`expected Storage instance to have disposed "${key2}" but it did not dispose any keys at all`))
    })

    it('fails if the key was not disposed', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })
      const key2 = await storage.store({ name: 'test-2.png', data: file2 })

      await storage.dispose(key2)

      let error: Error

      try {
        expect(storage).toHaveDisposed(key)
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected Storage instance to have disposed "${key}" but it did not

Disposed keys were:

"${key2} -> test-2.png"`)
      )
    })
  })

  describe('against the Storage class', (): void => {
    it('asserts key being disposed', async (): Promise<void> => {
      const storage = new Storage()

      expect(Storage).not.toHaveDisposed('some-key')

      const key = await storage.store({ name: 'test-1.png', data: file1 })
      const key2 = await storage.store({ name: 'test-2.png', data: file2 })

      expect(Storage).not.toHaveDisposed(key)
      expect(Storage).not.toHaveDisposed(key2)

      await storage.dispose(key)

      expect(Storage).toHaveDisposed(key)
      expect(Storage).not.toHaveDisposed(key2)

      await storage.dispose(key2)

      expect(Storage).toHaveDisposed(key)
      expect(Storage).toHaveDisposed(key2)
    })

    it('fails if key is disposed and it was not expected to be', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.dispose(key)

      let error: Error

      try {
        expect(Storage).not.toHaveDisposed(key)
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi(`expected "${key}" not to have been disposed but it was`))
    })

    it('fails if no keys were disposed', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      let error: Error

      try {
        expect(Storage).toHaveDisposed(key)
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi(`expected "${key}" to have been disposed but no keys were disposed at all`))
    })

    it('asserts file being disposed does not matter by which instance', async (): Promise<void> => {
      const storage = new Storage()
      const otherStorage = new Storage()

      const key2 = await otherStorage.store({ name: 'test-1.png', data: file1 })

      await otherStorage.dispose(key2)

      expect(Storage).toHaveDisposed(key2)
    })

    it('fails if the key was not disposed', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })
      const key2 = await storage.store({ name: 'test-2.png', data: file2 })

      await storage.dispose(key2)

      let error: Error

      try {
        expect(Storage).toHaveDisposed(key)
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected "${key}" to have been disposed but it was not

Disposed keys were:

"${key2} -> test-2.png"`)
      )
    })
  })
})
