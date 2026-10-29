import test from 'node:test'
import assert from 'node:assert/strict'
import { deadlineInputs, formatDeadline } from '../src/time.js'

test('deadline display and inputs use Lebanon time', () => {
  assert.deepEqual(deadlineInputs('2027-07-15T09:00:00Z'), { date: '2027-07-15', time: '12:00' })
  assert.deepEqual(deadlineInputs('2027-01-15T09:00:00Z'), { date: '2027-01-15', time: '11:00' })
  assert.match(formatDeadline('2027-07-15T09:00:00Z'), /12:00/)
})