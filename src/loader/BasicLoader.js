const Class = require('../core/Class');
const EventMixin = require('../core/EventMixin');
const Cache = require('./Cache');
const util = require('../utils/util');

const cache = new Cache();

/**
 * 基础的资源加载类
 * @class
 * @fires beforeload loaded failed
 * @mixes EventMixin
 * @borrows EventMixin#on as #on
 * @borrows EventMixin#off as #off
 * @borrows EventMixin#fire as #fire
 * @example
 * var loader = new Hilo3d.BasicLoader();
 * loader.load({
 *     src: '//img.alicdn.com/tfs/TB1aNxtQpXXXXX1XVXXXXXXXXXX-1024-1024.jpg',
 *     crossOrigin: true
 * }).then(img => {
 *     return new Hilo3d.Texture({
 *         image: img
 *     });
 * }, err => {
 *     return new Hilo3d.Color(1, 0, 0);
 * }).then(diffuse => {
 *     return new Hilo3d.BasicMaterial({
 *         diffuse: diffuse 
 *     });
 * });
 */
const BasicLoader = Class.create(/** @lends BasicLoader.prototype */{
    Mixes: EventMixin,
    Statics: {
        _cache: cache,
        deleteCache(key) {
            cache.remove(key);
        },
        clearCache() {
            cache.clear();
        }
    },
    /**
     * 加载资源，这里会自动调用 loadImg 或者 loadRes
     * @param {object} data 参数
     * @param {string} data.src 资源地址
     * @param {string} [data.type] 资源类型(img, json, buffer)，不提供将根据 data.src 来判断类型
     * @return {Promise.<data, Error>} 返回加载完的资源对象
     */
    load(data) {
        const src = data.src;
        let type = data.type;
        if (!type) {
            const ext = util.getExtension(src);
            if (/^(?:png|jpe?g|gif|webp|bmp)$/i.test(ext)) {
                type = 'img';
            }
        }
        if (type === 'img') {
            return this.loadImg(src, data.crossOrigin);
        }
        return this.loadRes(src, type);
    },
    /**
     * 判断链接是否跨域，无法处理二级域名，及修改 document.domain 的情况
     * @param {string} url 需要判断的链接
     * @return {boolean} 是否跨域
     */
    isCrossOrigin(url) {
        const loc = window.location;
        const a = document.createElement('a');
        a.href = url;
        return a.hostname !== loc.hostname || a.port !== loc.port || a.protocol !== loc.protocol;
    },
    /**
     * 加载图片
     * @param {string} url 图片地址
     * @param {boolean} [crossOrigin=false] 是否跨域
     * @return {Promise.<Image, Error>} 返回加载完的图片
     */
    loadImg(url, crossOrigin) {
        let file = cache.get(url);
        if (file) {
            return cache.wait(file);
        }

        return new Promise((resolve, reject) => {
            let img = new Image();
            cache.update(url, Cache.PENDING);
            img.onload = () => {
                img.onerror = null;
                img.onabort = null;
                img.onload = null;
                cache.update(url, Cache.LOADED, img);
                resolve(img);
            };
            img.onerror = () => {
                img.onerror = null;
                img.onabort = null;
                img.onload = null;
                const err = new Error(`Image load failed for ${url.slice(0, 100)}`);
                cache.update(url, Cache.FAILED, err);
                reject(err);
            };
            img.onabort = img.onerror;
            if (crossOrigin || this.isCrossOrigin(url)) {
                img.crossOrigin = 'anonymous';
            }
            img.src = url;
        });
    },
    /**
     * 使用XHR加载其他资源
     * @param {string} url 资源地址
     * @param {string} [type=text] 资源类型(json, buffer, text)
     * @return {Promise.<data, Error>} 返回加载完的内容对象(Object, ArrayBuffer, String)
     */
    loadRes(url, type) {
        if (/^data:(.+?);base64,/.test(url)) {
            const mime = RegExp.$1;
            const base64Str = url.slice(13 + mime.length);
            let result = atob(base64Str);
            if (type === 'json') {
                result = JSON.parse(result);
            } else if (type === 'buffer') {
                result = Uint8Array.from(result, c => c.charCodeAt(0)).buffer;
            }
            return Promise.resolve(result);
        }

        let file = cache.get(url);
        if (file) {
            return cache.wait(file);
        }

        cache.update(url, Cache.PENDING);

        this.fire('beforeload');

        return this.request({ url, type }).then(data => {
            this.fire('loaded');
            cache.update(url, Cache.LOADED, data);
            return data;
        }, err => {
            this.fire('failed', err);
            cache.update(url, Cache.FAILED);
            throw new Error(`Resource load failed for ${url}, ${err}`);
        });
    },
    /**
     * XHR资源请求
     * @param {object} opt 请求参数
     * @param {string} opt.url 资源地址
     * @param {string} [opt.type=text] 资源类型(json, buffer, text)
     * @param {string} [opt.method=GET] 请求类型(GET, POST ..)
     * @param {object} [opt.headers] 请求头参数
     * @param {string} [opt.body] POST请求发送的数据
     * @return {Promise.<data, Error>} 返回加载完的内容对象(Object, ArrayBuffer, String)
     */
    request(opt) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.onload = () => {
                if (xhr.status < 200 || xhr.status >= 300) {
                    reject(new TypeError(`Network request failed for ${xhr.status}`));
                    return;
                }
                let result = 'response' in xhr ? xhr.response : xhr.responseText;
                if (opt.type === 'json') {
                    try {
                        result = JSON.parse(result);
                    } catch (err) {
                        reject(new TypeError('JSON.parse error' + err));
                        return;
                    }
                }
                resolve(result);
            };
            xhr.onprogress = evt => {
                this.fire('progress', {
                    url: opt.url,
                    loaded: evt.loaded,
                    total: evt.total,
                });
            };
            xhr.onerror = () => {
                reject(new TypeError('Network request failed'));
            };
            xhr.ontimeout = () => {
                reject(new TypeError('Network request timed out'));
            };
            xhr.open(opt.method || 'GET', opt.url, true);
            if (opt.credentials === 'include') {
                xhr.withCredentials = true;
            }
            if (opt.type === 'buffer') {
                xhr.responseType = 'arraybuffer';
            }
            util.each(opt.headers, (value, name) => {
                xhr.setRequestHeader(name, value);
            });
            xhr.send(opt.body || null);
        });
    }
});

module.exports = BasicLoader;