import assert from 'node:assert/strict'
import test from 'node:test'
import { apiUrl } from './api.js'

test('uses same-origin paths when no API base URL is configured', () => {
  assert.equal(apiUrl('/api/hotels'), '/api/hotels')
})

test('normalizes API paths to start with a slash', () => {
  assert.equal(apiUrl('api/hotels'), '/api/hotels')
})
