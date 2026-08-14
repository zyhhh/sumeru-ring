import { diffArrays, diffWordsWithSpace } from 'diff'

export type DiffKind = 'same' | 'added' | 'removed' | 'modified'
export type SegmentKind = 'same' | 'added' | 'removed'

export interface TextSegment { text: string; kind: SegmentKind }
export interface DiffSide { lineNumber: number; segments: TextSegment[] }
export interface DiffRow { id: number; kind: DiffKind; differenceId?: number; left?: DiffSide; right?: DiffSide }
export interface DiffStats { added: number; removed: number; modified: number; total: number }
export interface TextDiffResult { rows: DiffRow[]; stats: DiffStats; differenceIds: number[] }
export type VisibleDiffItem = { type: 'row'; row: DiffRow } | { type: 'gap'; id: string; count: number; rows: DiffRow[] }

function lines(value: string): string[] {
  if (!value) return []
  const result = value.split('\n')
  if (result.at(-1) === '') result.pop()
  return result.map(line => line.endsWith('\r') ? line.slice(0, -1) : line)
}

function plain(text: string): TextSegment[] { return [{ text, kind: 'same' }] }
function normalizeWhitespace(text: string) { return text.trim().replace(/\s+/g, ' ') }

function inlineDiff(left: string, right: string, ignoreWhitespace: boolean) {
  if (ignoreWhitespace && normalizeWhitespace(left) === normalizeWhitespace(right)) return { left: plain(left), right: plain(right) }
  const changes = diffWordsWithSpace(left, right)
  return {
    left: changes.filter(change => !change.added).map(change => ({ text: change.value, kind: change.removed ? 'removed' : 'same' } as TextSegment)),
    right: changes.filter(change => !change.removed).map(change => ({ text: change.value, kind: change.added ? 'added' : 'same' } as TextSegment)),
  }
}

export function compareText(original: string, modified: string, ignoreWhitespace = false): TextDiffResult {
  const changes = diffArrays(lines(original), lines(modified), ignoreWhitespace ? { comparator: (left, right) => normalizeWhitespace(left) === normalizeWhitespace(right) } : undefined)
  const rows: DiffRow[] = []; const differenceIds: number[] = []
  let leftLine = 1; let rightLine = 1; let rowId = 0; let differenceId = 0
  let added = 0; let removed = 0; let modifiedBlocks = 0

  for (let index = 0; index < changes.length;) {
    const change = changes[index]!
    if (!change.added && !change.removed) {
      for (const text of change.value) rows.push({ id: rowId++, kind: 'same', left: { lineNumber: leftLine++, segments: plain(text) }, right: { lineNumber: rightLine++, segments: plain(text) } })
      index += 1; continue
    }

    const removedChange = change.removed ? change : undefined
    const next = changes[index + 1]
    const addedChange = change.added ? change : (next?.added ? next : undefined)
    const removedLines = removedChange?.value ?? []
    const addedLines = addedChange?.value ?? []
    differenceId += 1; differenceIds.push(differenceId)
    if (removedLines.length && addedLines.length) modifiedBlocks += 1
    removed += removedLines.length; added += addedLines.length

    for (let offset = 0; offset < Math.max(removedLines.length, addedLines.length); offset += 1) {
      const left = removedLines[offset]; const right = addedLines[offset]
      if (left !== undefined && right !== undefined) {
        const segments = inlineDiff(left, right, ignoreWhitespace)
        rows.push({ id: rowId++, kind: 'modified', differenceId, left: { lineNumber: leftLine++, segments: segments.left }, right: { lineNumber: rightLine++, segments: segments.right } })
      } else if (left !== undefined) rows.push({ id: rowId++, kind: 'removed', differenceId, left: { lineNumber: leftLine++, segments: [{ text: left, kind: 'removed' }] } })
      else if (right !== undefined) rows.push({ id: rowId++, kind: 'added', differenceId, right: { lineNumber: rightLine++, segments: [{ text: right, kind: 'added' }] } })
    }
    index += removedChange && addedChange ? 2 : 1
  }

  return { rows, differenceIds, stats: { added, removed, modified: modifiedBlocks, total: differenceIds.length } }
}

export function compactRows(rows: DiffRow[], context = 3): VisibleDiffItem[] {
  const keep = rows.map(row => row.kind !== 'same')
  rows.forEach((row, index) => {
    if (row.kind === 'same') return
    for (let cursor = Math.max(0, index - context); cursor <= Math.min(rows.length - 1, index + context); cursor += 1) keep[cursor] = true
  })

  const items: VisibleDiffItem[] = []
  for (let index = 0; index < rows.length;) {
    if (keep[index]) { items.push({ type: 'row', row: rows[index]! }); index += 1; continue }
    const start = index
    while (index < rows.length && !keep[index]) index += 1
    const hiddenRows = rows.slice(start, index)
    items.push({ type: 'gap', id: `${start}-${index - 1}`, count: hiddenRows.length, rows: hiddenRows })
  }
  return items
}
