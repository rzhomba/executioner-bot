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

    add = async (id, data) => {
        if (this.has(id)) {
            return false;
        }

        const schedule = [];

        for (const interval of this.intervals) {
            const timeoutId = setTimeout(async () => {
                await this.handler(data);
            }, interval);

            schedule.push(timeoutId);
        }

        const timeoutId = setTimeout(async () => {
            await this.clear(id, data);
        }, this.intervals[this.intervals.length - 1]);

        schedule.push(timeoutId);

        this._schedule.set(id, schedule);
        this._targets.set(id, data);

        return true;
    };

    clear = async (id, data) => {
        if (!this.has(id)) {
            return false;
        }

        const target = this._targets.get(id);

        if (this.callback) {
            await this.callback({ ...target, ...data });
        }

        for (const timeoutId of this._schedule.get(id).values()) {
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
                await this.callback({ ...target, ...data });
            }
        }

        for (const schedule of this._schedule.values()) {
            for (const timeoutId of schedule) {
                clearTimeout(timeoutId);
            }
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