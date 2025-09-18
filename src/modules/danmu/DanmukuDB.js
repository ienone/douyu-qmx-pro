/**
 * =================================================================================
 * 斗鱼弹幕助手 - 弹幕数据库
 * ---------------------------------------------------------------------------------
 * 作为与 IndexedDB 交互的唯一接口，提供数据模型的定义以及CRUD操作
 * =================================================================================
 */

import { SETTINGS } from '../../modules/SettingsManager';
import { Utils } from '../../utils/utils.js';
// 引入 FlexSearch 用于高性能全文搜索
// 注意: 需要先安装 flexsearch: npm install flexsearch
import { Index } from 'flexsearch';

/**
 * 弹幕数据库管理器
 */
export const DanmukuDB = {
    
    // 数据库实例
    db: null,
    
    // 数据库是否已初始化
    initialized: false,
    
    // 内存中的数据缓存
    memoryCache: new Map(),
    
    // FlexSearch 索引实例
    searchIndex: null,
    
    // 索引是否已构建
    indexBuilt: false,
    
    /**
     * 初始化数据库
     * @returns {Promise<boolean>} 初始化是否成功
     */
    async init() {
        if (this.initialized) {
            return true;
        }
        
        try {
            this.db = await this._openDatabase();
            this.initialized = true;
            
            // 初始化完成后立即构建内存索引
            await this._buildMemoryIndex();
            
            Utils.log('弹幕数据库初始化成功');
            return true;
        } catch (error) {
            Utils.log(`弹幕数据库初始化失败: ${error.message}`, 'error');
            return false;
        }
    },
    
    /**
     * 打开数据库
     * @returns {Promise<IDBDatabase>} 数据库实例
     * @private
     */
    _openDatabase() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(SETTINGS.DB_NAME, SETTINGS.DB_VERSION);
            
            request.onerror = () => {
                reject(new Error('数据库打开失败'));
            };
            
            request.onsuccess = (event) => {
                resolve(event.target.result);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // 创建弹幕模板存储对象
                if (!db.objectStoreNames.contains(SETTINGS.DB_STORE_NAME)) {
                    const store = db.createObjectStore(SETTINGS.DB_STORE_NAME, {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    
                    // 创建索引 - 优化排序性能
                    store.createIndex('text', 'text', { unique: false });
                    store.createIndex('tags', 'tags', { unique: false, multiEntry: true });
                    store.createIndex('syncState', 'syncState', { unique: false });
                    store.createIndex('lastUsed', 'lastUsed', { unique: false });
                    store.createIndex('useCount', 'useCount', { unique: false });
                    store.createIndex('popularity', 'popularity', { unique: false }); // 新增：人气值索引
                    store.createIndex('originalId', 'originalId', { unique: false }); // 新增：原始API ID索引
                    store.createIndex('category', 'category', { unique: false }); // 新增：分类索引
                }
                
                // 创建标签字典存储对象
                if (!db.objectStoreNames.contains('tag_dictionary')) {
                    const tagStore = db.createObjectStore('tag_dictionary', {
                        keyPath: 'dictValue'
                    });
                    tagStore.createIndex('dictLabel', 'dictLabel', { unique: false });
                    tagStore.createIndex('dictType', 'dictType', { unique: false });
                }
                
                // 创建导入日志存储对象
                if (!db.objectStoreNames.contains('import_logs')) {
                    const logStore = db.createObjectStore('import_logs', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    logStore.createIndex('timestamp', 'timestamp', { unique: false });
                    logStore.createIndex('status', 'status', { unique: false });
                }
            };
        });
    },
    
    /**
     * 添加弹幕模板
     * @param {string} text - 弹幕文本
     * @param {string[]} tags - 标签数组
     * @returns {Promise<number|null>} 新增记录的ID或null
     */
    async add(text, tags = []) {
        if (!this.initialized) {
            Utils.log('数据库未初始化', 'error');
            return null;
        }
        
        try {
            const danmukuData = {
                text: text.trim(),
                tags: tags.filter(tag => tag.trim()),
                syncState: 'pending', // 待同步状态
                createdAt: Date.now(),
                lastUsed: Date.now(),
                useCount: 1
            };
            
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const request = store.add(danmukuData);
            
            return new Promise((resolve, reject) => {
                request.onsuccess = (event) => {
                    const id = event.target.result;
                    const newData = { ...danmukuData, id };
                    
                    // 更新内存缓存
                    this.memoryCache.set(id, newData);
                    
                    // 更新搜索索引
                    if (this.searchIndex) {
                        const searchContent = [newData.text, ...newData.tags].join(' ');
                        this.searchIndex.add(newData.id, searchContent);
                    }
                    
                    Utils.log(`弹幕模板添加成功: ${text}`);
                    resolve(id);
                };
                
                request.onerror = () => {
                    reject(new Error('添加弹幕模板失败'));
                };
            });
        } catch (error) {
            Utils.log(`添加弹幕模板异常: ${error.message}`, 'error');
            return null;
        }
    },
    
    /**
     * 搜索弹幕模板（改进排序逻辑）
     * @param {string} query - 搜索关键词
     * @param {number} limit - 限制结果数量
     * @param {string} sortBy - 排序方式: 'relevance', 'popularity', 'recent', 'usage'
     * @returns {Promise<Array>} 匹配的弹幕模板数组
     */
    async search(query, limit = SETTINGS.maxSuggestions, sortBy = 'relevance') {
        if (!this.initialized || !query) {
            Utils.log('搜索条件无效: 数据库未初始化或查询为空');
            return [];
        }

        try {
            // 确保索引已构建
            if (!this.indexBuilt) {
                await this._buildMemoryIndex();
            }

            // 使用 FlexSearch 进行高效搜索
            const searchIds = this.searchIndex.search(query, limit * 2); // 获取更多结果用于排序

            // 根据搜索到的ID获取完整数据
            let matchedDanmuku = searchIds
                .map(id => this.memoryCache.get(id))
                .filter(item => item);

            // 根据排序方式进行排序
            switch (sortBy) {
                case 'popularity':
                    matchedDanmuku.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
                    break;
                case 'recent':
                    matchedDanmuku.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
                    break;
                case 'usage':
                    matchedDanmuku.sort((a, b) => {
                        if (b.useCount !== a.useCount) {
                            return (b.useCount || 0) - (a.useCount || 0);
                        }
                        return (b.lastUsed || 0) - (a.lastUsed || 0);
                    });
                    break;
                default: // relevance
                    matchedDanmuku.sort((a, b) => {
                        // 综合排序：使用次数 + 人气 + 最近使用
                        const scoreA = (a.useCount || 0) * 0.4 + (a.popularity || 0) * 0.3 + ((a.lastUsed || 0) / 1000000) * 0.3;
                        const scoreB = (b.useCount || 0) * 0.4 + (b.popularity || 0) * 0.3 + ((b.lastUsed || 0) / 1000000) * 0.3;
                        return scoreB - scoreA;
                    });
                    break;
            }

            // 限制最终结果数量
            const finalResults = matchedDanmuku.slice(0, limit);

            Utils.log(`搜索 "${query}" (${sortBy}) 返回 ${finalResults.length} 条结果`);
            return finalResults;

        } catch (error) {
            Utils.log(`搜索弹幕模板异常: ${error.message}`, 'error');
            return [];
        }
    },
    
    /**
     * 更新弹幕模板使用统计
     * @param {number} id - 弹幕模板ID
     * @returns {Promise<boolean>} 是否更新成功
     */
    async updateUsage(id) {
        if (!this.initialized) {
            return false;
        }
        
        try {
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            
            // 先获取现有数据
            const getRequest = store.get(id);
            
            return new Promise((resolve) => {
                getRequest.onsuccess = (event) => {
                    const data = event.target.result;
                    if (data) {
                        // 更新使用统计
                        data.useCount = (data.useCount || 0) + 1;
                        data.lastUsed = Date.now();
                        
                        const putRequest = store.put(data);
                        putRequest.onsuccess = () => {
                            // 同步更新内存缓存
                            this.memoryCache.set(id, data);
                            
                            // 更新搜索索引
                            if (this.searchIndex) {
                                const searchContent = [data.text, ...data.tags].join(' ');
                                this.searchIndex.update(data.id, searchContent);
                            }
                            
                            resolve(true);
                        };
                        putRequest.onerror = () => resolve(false);
                    } else {
                        resolve(false);
                    }
                };
                
                getRequest.onerror = () => resolve(false);
            });
        } catch (error) {
            Utils.log(`更新使用统计异常: ${error.message}`, 'error');
            return false;
        }
    },
    
    /**
     * 删除弹幕模板
     * @param {number} id - 弹幕模板ID
     * @returns {Promise<boolean>} 是否删除成功
     */
    async delete(id) {
        if (!this.initialized) {
            return false;
        }
        
        try {
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const request = store.delete(id);
            
            return new Promise((resolve) => {
                request.onsuccess = () => {
                    // 从内存缓存中删除
                    this.memoryCache.delete(id);
                    
                    // 从搜索索引中删除
                    if (this.searchIndex) {
                        this.searchIndex.remove(id);
                    }
                    
                    Utils.log(`弹幕模板删除成功: ID ${id}`);
                    resolve(true);
                };
                
                request.onerror = () => {
                    Utils.log(`弹幕模板删除失败: ID ${id}`, 'error');
                    resolve(false);
                };
            });
        } catch (error) {
            Utils.log(`删除弹幕模板异常: ${error.message}`, 'error');
            return false;
        }
    },
    
    /**
     * 获取所有弹幕模板
     * @returns {Promise<Array>} 所有弹幕模板
     */
    async getAll() {
        if (!this.initialized) {
            return [];
        }
        
        try {
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], 'readonly');
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const request = store.getAll();
            
            return new Promise((resolve) => {
                request.onsuccess = (event) => {
                    resolve(event.target.result || []);
                };
                
                request.onerror = () => {
                    Utils.log('获取所有弹幕模板失败', 'error');
                    resolve([]);
                };
            });
        } catch (error) {
            Utils.log(`获取所有弹幕模板异常: ${error.message}`, 'error');
            return [];
        }
    },
    
    /**
     * 清空数据库
     * @returns {Promise<boolean>} 是否清空成功
     */
    async clear() {
        if (!this.initialized) {
            return false;
        }
        
        try {
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], 'readwrite');
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const request = store.clear();
            
            return new Promise((resolve) => {
                request.onsuccess = () => {
                    // 清空内存缓存和搜索索引
                    this.memoryCache.clear();
                    if (this.searchIndex) {
                        this.searchIndex = null;
                        this.indexBuilt = false;
                    }
                    
                    Utils.log('弹幕数据库已清空');
                    resolve(true);
                };
                
                request.onerror = () => {
                    Utils.log('清空弹幕数据库失败', 'error');
                    resolve(false);
                };
            });
        } catch (error) {
            Utils.log(`清空数据库异常: ${error.message}`, 'error');
            return false;
        }
    },
    
    /**
     * 初始化标签字典
     * @returns {Promise<boolean>} 是否初始化成功
     */
    async initTagDictionary() {
        try {
            const response = await fetch('https://hguofichp.cn:10086/machine/dictList');
            const result = await response.json();
            
            if (result.code === 200 && result.data) {
                const transaction = this.db.transaction(['tag_dictionary'], 'readwrite');
                const store = transaction.objectStore('tag_dictionary');
                
                // 清空现有数据
                await new Promise((resolve, reject) => {
                    const clearRequest = store.clear();
                    clearRequest.onsuccess = () => resolve();
                    clearRequest.onerror = () => reject(new Error('清空标签字典失败'));
                });
                
                // 添加新数据
                for (const tag of result.data) {
                    await new Promise((resolve, reject) => {
                        const addRequest = store.add(tag);
                        addRequest.onsuccess = () => resolve();
                        addRequest.onerror = () => reject(new Error('添加标签失败'));
                    });
                }
                
                Utils.log(`标签字典初始化完成，共 ${result.data.length} 个标签`);
                return true;
            }
            return false;
        } catch (error) {
            Utils.log(`标签字典初始化失败: ${error.message}`, 'error');
            return false;
        }
    },

    /**
     * 获取标签字典
     * @returns {Promise<Array>} 标签数组
     */
    async getTagDictionary() {
        try {
            const transaction = this.db.transaction(['tag_dictionary'], 'readonly');
            const store = transaction.objectStore('tag_dictionary');
            const request = store.getAll();
            
            return new Promise((resolve) => {
                request.onsuccess = (event) => {
                    resolve(event.target.result || []);
                };
                request.onerror = () => resolve([]);
            });
        } catch (error) {
            Utils.log(`获取标签字典失败: ${error.message}`, 'error');
            return [];
        }
    },


    /**
     * 从指定的URL导入弹幕数据
     * @param {string} url - 包含弹幕数据的JSON文件的URL
     * @returns {Promise<Object|null>} 导入结果统计或null
     */
    async importFromUrl(url) {
        Utils.log(`开始从 URL 下载弹幕数据: ${url}`);
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`网络响应错误: ${response.status} ${response.statusText}`);
            }

            const jsonData = await response.json();
            Utils.log(`数据下载成功，共 ${jsonData.length} 条。开始导入数据库...`);

            // 调用现有的 importFromJson 函数处理数据
            return await this.importFromJson(jsonData);

        } catch (error) {
            Utils.log(`从 URL 导入数据失败: ${error.message}`, 'error');
            return null;
        }
    },


    /**
     * 从JSON数据导入弹幕
     * @param {Array} jsonData - 弹幕数据数组
     * @returns {Promise<Object>} 导入结果统计
     */
    async importFromJson(jsonData) {
        const startTime = Date.now();
        const importLog = {
            timestamp: startTime,
            source: 'json_data',
            status: 'running',
            totalProcessed: 0,
            successCount: 0,
            failCount: 0,
            duplicateCount: 0,
            errors: []
        };

        try {
            const tagDict = await this.getTagDictionary();
            const tagMap = new Map(tagDict.map(tag => [tag.dictValue, tag.dictLabel]));

            const existingData = await this.getAll();
            const existingTexts = new Set(existingData.map(item => item.text));
            
            importLog.totalProcessed = jsonData.length;

            for (const item of jsonData) {
                try {
                    if (existingTexts.has(item.barrage)) {
                        importLog.duplicateCount++;
                        continue;
                    }

                    const tagValues = item.tags ? String(item.tags).split(',').map(t => t.trim()) : [];
                    const tagLabels = tagValues.map(value => tagMap.get(value) || value).filter(Boolean);

                    const danmakuData = {
                        text: item.barrage.trim(),
                        tags: tagLabels,
                        originalId: item.id,
                        popularity: parseInt(item.cnt) || 0,
                        category: 'imported',
                        syncState: 'synced',
                        createdAt: new Date(item.submitTime).getTime(),
                        lastUsed: 0,
                        useCount: 0,
                        source: 'json_import',
                        importBatch: startTime
                    };

                    const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], 'readwrite');
                    const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
                    
                    await new Promise((resolve, reject) => {
                        const addRequest = store.add(danmakuData);
                        addRequest.onsuccess = () => resolve();
                        addRequest.onerror = (e) => reject(new Error(`数据库添加失败: ${e.target.error}`));
                    });

                    existingTexts.add(item.barrage);
                    importLog.successCount++;

                } catch (error) {
                    importLog.failCount++;
                    importLog.errors.push(`处理弹幕 (ID: ${item.id}) 失败: ${error.message}`);
                }
            }

            importLog.status = 'completed';
            importLog.duration = Date.now() - startTime;
            await this._saveImportLog(importLog);
            await this._buildMemoryIndex(); // 导入后重建索引

            Utils.log(`JSON数据导入完成！成功 ${importLog.successCount}, 失败 ${importLog.failCount}, 重复 ${importLog.duplicateCount}`);
            
            return importLog;

        } catch (error) {
            importLog.status = 'failed';
            importLog.duration = Date.now() - startTime;
            importLog.errors.push(`导入过程异常: ${error.message}`);
            await this._saveImportLog(importLog);
            Utils.log(`从JSON导入数据失败: ${error.message}`, 'error');
            return importLog;
        }
    },

    /**
     * 自动导入弹幕数据
     * @returns {Promise<Object>} 导入结果统计
     */
    async autoImportData() {
        const startTime = Date.now();
        const importLog = {
            timestamp: startTime,
            source: 'url_import',
            status: 'running',
            errors: []
        };

        try {
            // 首先初始化标签字典
            await this.initTagDictionary();

            const dataUrl = 'https://data.ienone.top/danmuku/danmuku_v0.json';
            const result = await this.importFromUrl(dataUrl);

            if (result) {
                Utils.log(`弹幕数据导入完成！`);
                return result;
            } else {
                throw new Error('从URL导入返回了null');
            }

        } catch (error) {
            importLog.status = 'failed';
            importLog.duration = Date.now() - startTime;
            importLog.errors.push(`导入过程异常: ${error.message}`);
            
            await this._saveImportLog(importLog);
            
            Utils.log(`弹幕数据导入失败: ${error.message}`, 'error');
            return importLog;
        }
    },

    /**
     * 保存导入日志
     * @param {Object} logData - 日志数据
     * @private
     */
    async _saveImportLog(logData) {
        try {
            const transaction = this.db.transaction(['import_logs'], 'readwrite');
            const store = transaction.objectStore('import_logs');
            
            await new Promise((resolve, reject) => {
                const addRequest = store.add(logData);
                addRequest.onsuccess = () => resolve();
                addRequest.onerror = () => reject(new Error('保存日志失败'));
            });
        } catch (error) {
            Utils.log(`保存导入日志失败: ${error.message}`, 'error');
        }
    },

    /**
     * 获取导入日志
     * @param {number} limit - 限制返回数量
     * @returns {Promise<Array>} 导入日志数组
     */
    async getImportLogs(limit = 10) {
        try {
            const transaction = this.db.transaction(['import_logs'], 'readonly');
            const store = transaction.objectStore('import_logs');
            const index = store.index('timestamp');
            const request = index.openCursor(null, 'prev');
            
            return new Promise((resolve) => {
                const logs = [];
                let count = 0;
                
                request.onsuccess = (event) => {
                    const cursor = event.target.result;
                    if (cursor && count < limit) {
                        logs.push(cursor.value);
                        count++;
                        cursor.continue();
                    } else {
                        resolve(logs);
                    }
                };
                
                request.onerror = () => resolve([]);
            });
        } catch (error) {
            Utils.log(`获取导入日志失败: ${error.message}`, 'error');
            return [];
        }
    },
    
    /**
     * 构建内存索引
     * @private
     */
    async _buildMemoryIndex() {
        if (this.indexBuilt || !this.initialized) {
            return;
        }
        
        try {
            // 从数据库加载所有弹幕模板到内存缓存
            const allData = await this.getAll();
            
            // 构建内存缓存
            this.memoryCache.clear();
            allData.forEach(item => {
                this.memoryCache.set(item.id, item);
            });
            
            // 创建 FlexSearch 索引配置
            this.searchIndex = new Index({
                tokenize: 'forward',
                resolution: 9, // resolution 1-9, 数值越大索引越精细
                depth: 3, // depth 1-5, 控制索引的层级深度
                encode: false, // 关闭编码以支持中文
                cache: true // 启用缓存以提升性能
            });
            
            // 添加所有数据到索引
            allData.forEach(item => {
                // 将文本和标签合并为搜索内容
                const searchContent = [item.text, ...item.tags].join(' ');
                this.searchIndex.add(item.id, searchContent);
            });
            
            this.indexBuilt = true;
            Utils.log(`内存索引构建完成，缓存 ${allData.length} 条弹幕模板`);
        } catch (error) {
            Utils.log(`构建内存索引异常: ${error.message}`, 'error');
        }
    },

    /**
     * 测试用自动导入功能
     * @returns {Promise<Object>} 导入结果统计
     */
    async testAutoImport() {
        Utils.log(`=== 开始测试自动导入功能 ===`);
        
        const result = await this.autoImportData();
        
        // 详细的测试报告
        Utils.log('=== 导入测试完成，结果统计 ===');
        Utils.log(`导入状态: ${result.status}`);
        Utils.log(`总处理数量: ${result.totalProcessed}`);
        Utils.log(`成功导入: ${result.successCount}`);
        Utils.log(`失败数量: ${result.failCount}`);
        Utils.log(`重复跳过: ${result.duplicateCount}`);
        Utils.log(`耗时: ${(result.duration / 1000).toFixed(2)} 秒`);
        
        if (result.errors.length > 0) {
            Utils.log('错误详情:', 'warn');
            result.errors.forEach((error, index) => {
                Utils.log(`${index + 1}. ${error}`, 'warn');
            });
        }
        
        // 验证导入后的数据
        const totalCount = await this.getDataCount();
        Utils.log(`当前数据库总数据量: ${totalCount}`);
        
        return result;
    },

    /**
     * 获取数据库中的数据总量
     * @returns {Promise<number>} 数据总量
     */
    async getDataCount() {
        try {
            const transaction = this.db.transaction([SETTINGS.DB_STORE_NAME], 'readonly');
            const store = transaction.objectStore(SETTINGS.DB_STORE_NAME);
            const request = store.count();
            
            return new Promise((resolve) => {
                request.onsuccess = (event) => {
                    resolve(event.target.result || 0);
                };
                request.onerror = () => resolve(0);
            });
        } catch (error) {
            Utils.log(`获取数据总量失败: ${error.message}`, 'error');
            return 0;
        }
    },

    /**
     * 获取数据统计信息
     * @returns {Promise<Object>} 统计信息
     */
    async getStatistics() {
        try {
            const allData = await this.getAll();
            const imported = allData.filter(item => item.category === 'imported');
            const userCreated = allData.filter(item => item.category !== 'imported');
            
            const stats = {
                total: allData.length,
                imported: imported.length,
                userCreated: userCreated.length,
                avgPopularity: imported.length > 0 
                    ? (imported.reduce((sum, item) => sum + (item.popularity || 0), 0) / imported.length).toFixed(1)
                    : 0,
                topUsed: allData
                    .sort((a, b) => (b.useCount || 0) - (a.useCount || 0))
                    .slice(0, 5)
                    .map(item => ({ text: item.text, useCount: item.useCount || 0 }))
            };
            
            Utils.log('=== 数据库统计信息 ===');
            Utils.log(`总数据量: ${stats.total}`);
            Utils.log(`导入数据: ${stats.imported}`);
            Utils.log(`用户创建: ${stats.userCreated}`);
            Utils.log(`平均人气: ${stats.avgPopularity}`);
            Utils.log('最常用弹幕:');
            stats.topUsed.forEach((item, index) => {
                Utils.log(`${index + 1}. "${item.text}" (使用${item.useCount}次)`);
            });
            
            return stats;
        } catch (error) {
            Utils.log(`获取统计信息失败: ${error.message}`, 'error');
            return {};
        }
    },
};
