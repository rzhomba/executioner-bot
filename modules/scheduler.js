class Scheduler {
    _targets = new Map();
    _schedule = new Map();

    intervals;
    handler;
    callback;

    constructor(intervals = [], handler = async () => {}, callback = async () => {}) {
        this.intervals = intervals;
        this.handler = handler;
        this.callback = callback;
    }


    get targets() {
        const list = [];
        for (const target of this._targets.values()) {
            list.push(target);
        }
        return list;
    }

    has = (targetId) => {
        return this._targets.has(targetId) && this._schedule.has(targetId);
    };

    hasAny = () => {
        return this._targets.size === 0 && this._schedule.size === 0;
    };

    add = async (targetId, data) => {
        if (this.has(targetId)) return false;

        const target = {
            targetId: targetId, data: data
        };
        const schedule = [];

        for (const interval of this.intervals) {
            const timeoutId = setTimeout(async () => {
                await this.handler(target);
            }, interval);

            schedule.push(timeoutId);
        }

        const timeoutId = setTimeout(async () => {
            await this.clear(targetId);
        }, this.intervals[this.intervals.length - 1]);

        schedule.push(timeoutId);

        this._schedule.set(targetId, schedule);
        this._targets.set(targetId, target);

        return true;
    };

    clear = async (targetId, data) => {
        if (!this.has(targetId)) {
            return false;
        }

        const target = this._targets.get(targetId);

        if (this.callback) {
            await this.callback(target, data);
        }

        for (const timeoutId of this._schedule.get(targetId).values()) {
            clearTimeout(timeoutId);
        }

        this._targets.clear();
        this._schedule.clear();

        return true;
    };

    clearAll = async (data) => {
        const count = this._targets.size;

        if (this.callback) {
            for (const target of this._targets.values()) {
                await this.callback(target, data);
            }
        }

        for (const timeoutId of this._schedule.values()) {
            clearTimeout(timeoutId);
        }

        this._targets.clear();
        this._schedule.clear();

        return count;
    };

    list = () => {
        return this._targets.values();
    };
}

module.exports = {
    Scheduler
};