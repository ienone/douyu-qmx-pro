/**
 * @file candidateDB.js
 * @description IndexedDB 候选项数据存取管理
 */

import { CandidateItem, validateCandidate, createCandidate } from './candidateType.js';

const DB_NAME = 'DouyuCandidateDB';
const DB_VERSION = 1;
const STORE_NAME = 'candidates';

/**
 * IndexedDB 数据库管理类
 */
class CandidateDatabase {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * 初始化数据库连接
     * @returns {Promise<IDBDatabase>} - 数据库实例
     */
    async init() {
        if (this.isInitialized && this.db) {
            return this.db;
        }

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => {
                console.error('CandidateDB: 数据库打开失败', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                this.isInitialized = true;
                console.log('CandidateDB: 数据库连接成功');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建候选项存储
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                    
                    // 创建索引
                    store.createIndex('text', 'text', { unique: false });
                    store.createIndex('category', 'category', { unique: false });
                    store.createIndex('useCount', 'useCount', { unique: false });
                    store.createIndex('lastUsed', 'lastUsed', { unique: false });
                    store.createIndex('priority', 'priority', { unique: false });
                    
                    console.log('CandidateDB: 数据库结构初始化完成');
                }
            };
        });
    }

    /**
     * 获取所有候选项
     * @returns {Promise<CandidateItem[]>} - 候选项列表
     */
    async getCandidates() {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readonly');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.getAll();

            request.onsuccess = () => {
                const candidates = request.result.map(data => {
                    // 重新创建 CandidateItem 实例
                    return new CandidateItem(data.id, data.text, {
                        priority: data.priority,
                        category: data.category,
                        useCount: data.useCount,
                        lastUsed: new Date(data.lastUsed),
                        createdAt: new Date(data.createdAt)
                    });
                });
                resolve(candidates);
            };

            request.onerror = () => {
                console.error('CandidateDB: 获取候选项失败', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 添加候选项
     * @param {string|CandidateItem} candidateData - 候选项文本或候选项对象
     * @returns {Promise<CandidateItem>} - 添加成功的候选项
     */
    async addCandidate(candidateData) {
        await this.init();
        
        let candidate;
        if (typeof candidateData === 'string') {
            candidate = createCandidate(candidateData);
        } else if (validateCandidate(candidateData)) {
            candidate = candidateData;
        } else {
            throw new Error('Invalid candidate data');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            // 转换为普通对象以存储
            const candidateObj = {
                id: candidate.id,
                text: candidate.text,
                priority: candidate.priority,
                category: candidate.category,
                useCount: candidate.useCount,
                lastUsed: candidate.lastUsed.toISOString(),
                createdAt: candidate.createdAt.toISOString()
            };
            
            const request = store.add(candidateObj);

            request.onsuccess = () => {
                console.log('CandidateDB: 候选项添加成功', candidate.text);
                resolve(candidate);
            };

            request.onerror = () => {
                console.error('CandidateDB: 候选项添加失败', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 更新候选项
     * @param {CandidateItem} candidate - 要更新的候选项
     * @returns {Promise<CandidateItem>} - 更新后的候选项
     */
    async updateCandidate(candidate) {
        await this.init();
        
        if (!validateCandidate(candidate)) {
            throw new Error('Invalid candidate data');
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            
            const candidateObj = {
                id: candidate.id,
                text: candidate.text,
                priority: candidate.priority,
                category: candidate.category,
                useCount: candidate.useCount,
                lastUsed: candidate.lastUsed.toISOString(),
                createdAt: candidate.createdAt.toISOString()
            };
            
            const request = store.put(candidateObj);

            request.onsuccess = () => {
                console.log('CandidateDB: 候选项更新成功', candidate.text);
                resolve(candidate);
            };

            request.onerror = () => {
                console.error('CandidateDB: 候选项更新失败', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 删除候选项
     * @param {string|number} id - 候选项ID
     * @returns {Promise<boolean>} - 是否删除成功
     */
    async removeCandidate(id) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.delete(id);

            request.onsuccess = () => {
                console.log('CandidateDB: 候选项删除成功', id);
                resolve(true);
            };

            request.onerror = () => {
                console.error('CandidateDB: 候选项删除失败', request.error);
                reject(request.error);
            };
        });
    }

    /**
     * 增加候选项使用次数
     * @param {string|number} id - 候选项ID
     * @returns {Promise<CandidateItem|null>} - 更新后的候选项
     */
    async incrementUseCount(id) {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const data = getRequest.result;
                if (data) {
                    data.useCount = (data.useCount || 0) + 1;
                    data.lastUsed = new Date().toISOString();
                    
                    const updateRequest = store.put(data);
                    updateRequest.onsuccess = () => {
                        const candidate = new CandidateItem(data.id, data.text, {
                            priority: data.priority,
                            category: data.category,
                            useCount: data.useCount,
                            lastUsed: new Date(data.lastUsed),
                            createdAt: new Date(data.createdAt)
                        });
                        resolve(candidate);
                    };
                    updateRequest.onerror = () => reject(updateRequest.error);
                } else {
                    resolve(null);
                }
            };

            getRequest.onerror = () => {
                console.error('CandidateDB: 获取候选项失败', getRequest.error);
                reject(getRequest.error);
            };
        });
    }

    /**
     * 清空所有候选项
     * @returns {Promise<boolean>} - 是否清空成功
     */
    async clearAll() {
        await this.init();
        
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([STORE_NAME], 'readwrite');
            const store = transaction.objectStore(STORE_NAME);
            const request = store.clear();

            request.onsuccess = () => {
                console.log('CandidateDB: 所有候选项已清空');
                resolve(true);
            };

            request.onerror = () => {
                console.error('CandidateDB: 清空候选项失败', request.error);
                reject(request.error);
            };
        });
    }
}

// 创建单例实例
const candidateDB = new CandidateDatabase();

// 导出单例和类
export { candidateDB as default, CandidateDatabase };

// 便利方法导出
export const getCandidates = () => candidateDB.getCandidates();
export const addCandidate = (candidateData) => candidateDB.addCandidate(candidateData);
export const removeCandidate = (id) => candidateDB.removeCandidate(id);
export const updateCandidate = (candidate) => candidateDB.updateCandidate(candidate);
export const incrementUseCount = (id) => candidateDB.incrementUseCount(id);
export const clearAllCandidates = () => candidateDB.clearAll();