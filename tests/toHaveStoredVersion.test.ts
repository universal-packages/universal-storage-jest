import { Storage } from '@universal-packages/storage'
import fs from 'fs'
import stripAnsi from 'strip-ansi'

import '../src'

const file1 = fs.readFileSync('./tests/__fixtures__/test-1.png')
const file2 = fs.readFileSync('./tests/__fixtures__/test-2.png')

describe('toHaveStoredVersion', (): void => {
  describe('against the exact Storage instance', (): void => {
    it('asserts file versions being stored', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      expect(storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      expect(storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'contain' })

      expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' })
    })

    it('asserts file version being stored with options', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      expect(storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      expect(storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' }, { bucket: 'test-bucket' })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'contain' }, { bucket: 'test-bucket' })

      expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' }, { bucket: 'test-bucket' })
    })

    it('fails if the file version was stored and it was not expected', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi('expected Storage instance not to have stored version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" but it did'))
    })

    it('fails if the file does not even exists', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/nop.png', { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected Storage instance to have stored the file but "./tests/__fixtures__/nop.png" does not exist')
    })

    it('fails if the file version was not stored with options and it was not expected', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      let error: Error

      try {
        expect(storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi('expected Storage instance not to have stored version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" with options {"bucket": "test-bucket"} but it did')
      )
    })

    it('fails and shows if no files were stored', async (): Promise<void> => {
      const storage = new Storage()

      let error: Error

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi('expected Storage instance to have stored version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" but it did not store any files at all')
      )
    })

    it('fails and shows if no files were stored with options', async (): Promise<void> => {
      const storage = new Storage()

      let error: Error

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(
          'expected Storage instance to have stored version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" with options {"bucket": "test-bucket"} but it did not store any files at all'
        )
      )
    })

    it('fails if the version was stored but not by the Storage instance', async (): Promise<void> => {
      const storage = new Storage()
      const otherStorage = new Storage()

      const key = await otherStorage.store({ name: 'test-1.png', data: file1 })
      await otherStorage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi('expected Storage instance to have stored version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" but it did not store any files at all')
      )
    })

    it('fails if the version was stored but not by the Storage instance with options', async (): Promise<void> => {
      const storage = new Storage()
      const otherStorage = new Storage()

      const key = await otherStorage.store({ name: 'test-1.png', data: file1 })
      await otherStorage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      let error: Error

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(
          'expected Storage instance to have stored version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" with options {"bucket": "test-bucket"} but it did not store any files at all'
        )
      )
    })

    it('fails if the original file it self was not stored', async (): Promise<void> => {
      const storage = new Storage()

      let error: Error

      const key = await storage.store({ name: 'test-2.png', data: file2 })
      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(
          'expected Storage instance to have stored version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" but "./tests/__fixtures__/test-1.png" was not even stored'
        )
      )
    })

    it('fails if the original file it self was not stored with options', async (): Promise<void> => {
      const storage = new Storage()

      let error: Error

      const key = await storage.store({ name: 'test-2.png', data: file2 })
      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(
          'expected Storage instance to have stored version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" with options {"bucket": "test-bucket"} but "./tests/__fixtures__/test-1.png" was not even stored'
        )
      )
    })

    it('fails if no versions were stored for the file', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 })

      let error: Error

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi('expected Storage instance to have stored version "v-100x100-contain" of "./tests/__fixtures__/test-1.png" but not a single version was generated for that file')
      )
    })

    it('fails if no versions were stored for the file with options', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 })

      let error: Error

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(
          'expected Storage instance to have stored version "v-100x100-contain" of "./tests/__fixtures__/test-1.png" with options {"bucket": "test-bucket"} but not a single version was generated for that file'
        )
      )
    })

    it('fails if the file version was not stored', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected Storage instance to have stored version "v-100x100-contain" of "./tests/__fixtures__/test-1.png" but it did not

Stored versions were:

"v-100x100-cover"`)
      )
    })

    it('fails if the file version was not stored with options', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { private: true })

      let error: Error

      try {
        expect(storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected Storage instance to have stored version "v-100x100-contain" of "./tests/__fixtures__/test-1.png" with options {"bucket": "test-bucket"} but it did not

Stored versions were:

"v-100x100-cover"
Options:

- Expected
+ Received

  Object {
-   "bucket": "test-bucket",
+   "private": true,
  }`)
      )
    })
  })

  describe('against the Storage class', (): void => {
    it('asserts file versions being stored', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      expect(Storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      expect(Storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'contain' })

      expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' })
    })

    it('asserts file version being stored with options', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      expect(Storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      expect(Storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' }, { bucket: 'test-bucket' })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'contain' }, { bucket: 'test-bucket' })

      expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' }, { bucket: 'test-bucket' })
    })

    it('fails if the file version was stored and it was not expected', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(Storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(stripAnsi('expected version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" not to have been stored but it was'))
    })

    it('fails if the file version was not stored with options and it was not expected', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      let error: Error

      try {
        expect(Storage).not.toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi('expected version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" not to have been stored with options {"bucket": "test-bucket"} but it was')
      )
    })

    it('fails if the file does not even exists', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(Storage).toHaveStoredVersion('./tests/__fixtures__/nop.png', { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual('expected file to have been stored but "./tests/__fixtures__/nop.png" does not exist')
    })

    it('fails and shows if no files were stored', async (): Promise<void> => {
      const storage = new Storage()

      let error: Error

      try {
        expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi('expected version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" to have been stored, but no files were stored at all')
      )
    })

    it('fails and shows if no files were stored with options', async (): Promise<void> => {
      const storage = new Storage()

      let error: Error

      try {
        expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(
          'expected version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" to have been stored with options {"bucket": "test-bucket"} but no files were stored at all'
        )
      )
    })

    it('asserts file versions being stored does not matter by which Storage instance', async (): Promise<void> => {
      const _storage = new Storage()
      const otherStorage = new Storage()

      const key = await otherStorage.store({ name: 'test-1.png', data: file1 })
      await otherStorage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
    })

    it('asserts file versions being stored does not matter by which Storage instance with options', async (): Promise<void> => {
      const _storage = new Storage()
      const otherStorage = new Storage()

      const key = await otherStorage.store({ name: 'test-1.png', data: file1 })
      await otherStorage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
    })

    it('fails if the original file it self was not stored', async (): Promise<void> => {
      const storage = new Storage()

      let error: Error

      const key = await storage.store({ name: 'test-2.png', data: file2 })
      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      try {
        expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi('expected version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" to have been stored but "./tests/__fixtures__/test-1.png" was not even stored')
      )
    })

    it('fails if the original file it self was not stored with options', async (): Promise<void> => {
      const storage = new Storage()

      let error: Error

      const key = await storage.store({ name: 'test-2.png', data: file2 })
      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })

      try {
        expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'cover' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(
          'expected version "v-100x100-cover" of "./tests/__fixtures__/test-1.png" to have been stored with options {"bucket": "test-bucket"} but "./tests/__fixtures__/test-1.png" was not even stored'
        )
      )
    })

    it('fails if no versions were stored for the file', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 })

      let error: Error

      try {
        expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi('expected version "v-100x100-contain" of "./tests/__fixtures__/test-1.png" to have been stored but not a single version was generated for that file')
      )
    })

    it('fails if no versions were stored for the file with options', async (): Promise<void> => {
      const storage = new Storage()

      await storage.store({ name: 'test-1.png', data: file1 })

      let error: Error

      try {
        expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(
          'expected version "v-100x100-contain" of "./tests/__fixtures__/test-1.png" to have been stored with options {"bucket": "test-bucket"} but not a single version was generated for that file'
        )
      )
    })

    it('fails if the file version was not stored', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' })

      let error: Error

      try {
        expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected version "v-100x100-contain" of "./tests/__fixtures__/test-1.png" to have been stored, but it was not

Stored versions were:

"v-100x100-cover"`)
      )
    })

    it('fails if the file version was not stored with options', async (): Promise<void> => {
      const storage = new Storage()

      const key = await storage.store({ name: 'test-1.png', data: file1 })

      await storage.storeVersion(key, { width: 100, height: 100, fit: 'cover' }, { private: true })

      let error: Error

      try {
        expect(Storage).toHaveStoredVersion('./tests/__fixtures__/test-1.png', { width: 100, height: 100, fit: 'contain' }, { bucket: 'test-bucket' })
      } catch (e) {
        error = e
      }

      expect(stripAnsi(error.message)).toEqual(
        stripAnsi(`expected version "v-100x100-contain" of "./tests/__fixtures__/test-1.png" to have been stored with options {"bucket": "test-bucket"} but it was not

Stored versions were:

"v-100x100-cover"
Options:

- Expected
+ Received

  Object {
-   "bucket": "test-bucket",
+   "private": true,
  }`)
      )
    })
  })
})
