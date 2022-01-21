"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongosInstance = void 0;
var MongosInstance = /** @class */ (function () {
    function MongosInstance(instanceConfig) {
        this.config = {
            mongos: {
                replicaSetKey: "",
                rootPassword: ""
            },
            shards: [],
            cfg: {
                secondaryCount: 0
            }
        };
        if (!instanceConfig.mongos.replicaSetKey ||
            !instanceConfig.mongos.rootPassword) {
            throw Error("missing replicaSetKey or rootPassword in mongosConfig");
        }
        this.config = __assign({}, instanceConfig);
    }
    MongosInstance.prototype.addShard = function (shardConfig) {
        this.config.shards.push(__assign({}, shardConfig));
    };
    return MongosInstance;
}());
exports.MongosInstance = MongosInstance;
