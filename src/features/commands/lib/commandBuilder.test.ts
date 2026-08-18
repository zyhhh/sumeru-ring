import { describe, expect, it } from 'vitest'
import { buildCommand } from './commandBuilder'

describe('buildCommand', () => {
  it('builds a Maven module command', () => {
    expect(buildCommand({ kind: 'maven', option: 'clean package', target: 'web app', extra: '-DskipTests' }))
      .toBe("mvn clean package -pl 'web app' -DskipTests")
  })

  it('builds a curl request', () => {
    expect(buildCommand({ kind: 'curl', option: '-X POST', target: 'https://api.test/items', extra: '-H "Accept: application/json"' }))
      .toContain('curl -X POST https://api.test/items')
  })
})
