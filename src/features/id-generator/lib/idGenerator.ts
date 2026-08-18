function formatUuid(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}

export function generateUuidV4(): string { return crypto.randomUUID() }

export function generateUuidV7(now = Date.now()): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  let timestamp = BigInt(now)
  for (let index = 5; index >= 0; index--) {
    bytes[index] = Number(timestamp & 0xffn)
    timestamp >>= 8n
  }
  bytes[6] = (bytes[6]! & 0x0f) | 0x70
  bytes[8] = (bytes[8]! & 0x3f) | 0x80
  return formatUuid(bytes)
}

export function generateUuid(): string { return generateUuidV4() }

export function toggleUuidHyphens(uuid: string): string {
  if (uuid.includes('-')) return uuid.replace(/-/g, '')
  if (!/^[0-9a-f]{32}$/i.test(uuid)) return uuid
  return `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`
}

export const DEFAULT_SNOWFLAKE_EPOCH = 1577836800000
export const TWITTER_SNOWFLAKE_EPOCH = 1288834974657

export function generateSnowflake(dataCenterId: number, workerId: number, sequence: number, now = Date.now(), epoch = DEFAULT_SNOWFLAKE_EPOCH): string {
  if (!Number.isInteger(dataCenterId) || dataCenterId < 0 || dataCenterId > 31) throw new Error('数据中心 ID 必须是 0-31 的整数')
  if (!Number.isInteger(workerId) || workerId < 0 || workerId > 31) throw new Error('机器 ID 必须是 0-31 的整数')
  if (!Number.isInteger(sequence) || sequence < 0 || sequence > 4095) throw new Error('序列号必须是 0-4095 的整数')
  if (!Number.isInteger(epoch) || epoch < 0) throw new Error('起始时间无效')
  const elapsed = BigInt(now) - BigInt(epoch)
  if (elapsed < 0n) throw new Error('起始时间不能晚于生成时间')
  if (elapsed >= 1n << 41n) throw new Error('起始时间超出雪花 ID 的 41 位时间范围')
  return (elapsed << 22n | BigInt(dataCenterId) << 17n | BigInt(workerId) << 12n | BigInt(sequence)).toString()
}
