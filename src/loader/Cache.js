const Class = require('../core/Class');
const EventMixin = require('../core/EventMixin');

/**
 * 加载缓存类
 * @class
 * @mixes EventMixin
 * @ignore
 */
const Cache = Class.create(/** @lends Cache.prototype */{
    Mixes: EventMixin,
    Statics: {
        PENDING: 1,
        LOADED: 2,
        FAILED: 3
    },
    enabled: true,
    /**
     * @constructs
     */
    constructor() {
        this._files = {};
    },
    update(key, state, data) {
        if (!this.enabled) {
            return;
        }
        let file = { key, state, data };
        this._files[key] = file;
        this.fire('update', file);
        this.fire(`update:${file.key}`, file);
    },
    get(key) {
        if (!this.enabled) {
            return null;
        }
        return this._files[key];
    },
    remove(key) {
        delete this._files[key];
    },
    clear() {
        this._files = {};
    },
    wait(file) {
        if (!file) {
            return Promise.reject();
        }
        if (file.state === Cache.LOADED) {
            return Promise.resolve(file.data);
        } else if (file.state === Cache.FAILED) {
            return Promise.reject();
        }

        return new Promise((resolve, reject) => {
            this.on(`update:${file.key}`, evt => {
                let file = evt.detail;
                if (file.state === Cache.LOADED) {
                    resolve(file.data);
                } else if (file.state === Cache.FAILED) {
                    reject(file.data);
                }
            }, true);
        });
    }
});

module.exports = Cache;