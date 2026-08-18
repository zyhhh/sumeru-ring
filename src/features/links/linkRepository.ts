import {defaultLinks} from './defaultLinks'
import type {LinkDraft, LinkItem} from './types'

const DB_NAME = 'sumeru-ring'
const DB_VERSION = 1
const STORE_NAME = 'links'

function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve()
        transaction.onerror = () => reject(transaction.error)
        transaction.onabort = () => reject(transaction.error)
    })
}

async function openDatabase(): Promise<IDBDatabase> {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
        const database = request.result
        if (!database.objectStoreNames.contains(STORE_NAME)) {
            const store = database.createObjectStore(STORE_NAME, {keyPath: 'id'})
            store.createIndex('category', 'category')
            store.createIndex('order', 'order')
        }
    }
    return requestToPromise(request)
}

async function writeItems(items: LinkItem[]): Promise<void> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    const store = transaction.objectStore(STORE_NAME)
    items.forEach((item) => store.put(item))
    await transactionDone(transaction)
    database.close()
}

export function normalizeHttpUrl(value: string): string {
    const withProtocol = /^https?:\/\//i.test(value.trim()) ? value.trim() : `https://${value.trim()}`
    const url = new URL(withProtocol)
    if (!['http:', 'https:'].includes(url.protocol)) throw new Error('网址只支持 http:// 或 https://')
    return url.toString()
}

export async function initializeLinks(): Promise<void> {
    const items = await listLinks()
    if (!items.length) await writeItems(defaultLinks)
}

export async function listLinks(): Promise<LinkItem[]> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readonly')
    const result = await requestToPromise(transaction.objectStore(STORE_NAME).getAll())
    database.close()
    return result.sort((left, right) => left.order - right.order)
}

export async function saveLink(draft: LinkDraft, existing?: LinkItem): Promise<LinkItem> {
    const now = new Date().toISOString()
    const items = await listLinks()
    const item: LinkItem = {
        ...draft,
        url: normalizeHttpUrl(draft.url),
        id: existing?.id ?? crypto.randomUUID(),
        order: existing?.order ?? (Math.max(0, ...items.map((link) => link.order)) + 10),
        isDefault: existing?.isDefault ?? false,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
    }
    await writeItems([item])
    return item
}

export async function deleteLink(id: string): Promise<void> {
    const database = await openDatabase()
    const transaction = database.transaction(STORE_NAME, 'readwrite')
    transaction.objectStore(STORE_NAME).delete(id)
    await transactionDone(transaction)
    database.close()
}

export async function replaceOrder(items: LinkItem[]): Promise<void> {
    const now = new Date().toISOString()
    await writeItems(items.map((item, index) => ({...item, order: (index + 1) * 10, updatedAt: now})))
}

export async function restoreDefaultLinks(): Promise<void> {
    await writeItems(defaultLinks.map((item) => ({...item, updatedAt: new Date().toISOString()})))
}

export async function importLinks(items: LinkItem[]): Promise<void> {
    const normalized = items.map((item) => ({
        ...item,
        url: normalizeHttpUrl(item.url),
        updatedAt: new Date().toISOString()
    }))
    await writeItems(normalized)
}

