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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoShardGenerator = void 0;
var yaml = __importStar(require("js-yaml"));
var MongoShardGenerator = /** @class */ (function () {
    function MongoShardGenerator(iGeneratorYamlConfig, iMongosInstance) {
        this.generatorYamlConfig = {
            projectName: "",
            shardCount: 1
        };
        this.mongosInstance = null;
        this.generatorYamlConfig = __assign({}, iGeneratorYamlConfig);
        this.mongosInstance = iMongosInstance;
    }
    MongoShardGenerator.prototype.generateYamlConfig = function () {
        var _a, _b;
        var composeConfig = {
            version: "3.4",
            services: {}
        };
        var mongosYaml = (_a = {},
            _a[this.generatorYamlConfig.projectName + "-mongodb-mongos"] = {
                image: "docker.io/bitnami/mongodb-sharded:4.4",
                environment: [
                    "MONGODB_ADVERTISED_HOSTNAME=" + this.generatorYamlConfig.projectName + "-mongodb-mongos",
                    "MONGODB_SHARDING_MODE=mongos",
                    "MONGODB_CFG_PRIMARY_HOST=" + this.generatorYamlConfig.projectName + "-mongodb-cfg",
                    "MONGODB_CFG_REPLICA_SET_NAME=" + this.generatorYamlConfig.projectName + "-config-replicaset",
                    "MONGODB_REPLICA_SET_KEY=" + this.mongosInstance.config.mongos.replicaSetKey,
                    "MONGODB_ROOT_PASSWORD=" + this.mongosInstance.config.mongos.rootPassword
                ],
                volumes: [
                    "./" + this.generatorYamlConfig.projectName + "-mongodb-shard/mongos-data:/bitnami"
                ],
                ports: [
                    "27017:27017"
                ]
            },
            _a);
        composeConfig.services = __assign(__assign({}, composeConfig.services), mongosYaml);
        this.addCfgYamlConfig(composeConfig);
        var shardIndex = 0;
        for (var _i = 0, _c = this.mongosInstance.config.shards; _i < _c.length; _i++) {
            var shardConfig = _c[_i];
            var shardPrimaryYaml = (_b = {},
                _b[this.generatorYamlConfig.projectName + "-mongodb-shard" + shardIndex + "-primary"] = {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    environment: [
                        "MONGODB_ADVERTISED_HOSTNAME=" + this.generatorYamlConfig.projectName + "-mongodb-shard" + shardIndex + "-primary",
                        "MONGODB_SHARDING_MODE=shardsvr",
                        "MONGODB_MONGOS_HOST=" + this.generatorYamlConfig.projectName + "-mongodb-mongos",
                        "MONGODB_ROOT_PASSWORD=" + this.mongosInstance.config.mongos.rootPassword,
                        "MONGODB_REPLICA_SET_MODE=primary",
                        "MONGODB_REPLICA_SET_KEY=" + this.mongosInstance.config.mongos.replicaSetKey,
                        "MONGODB_REPLICA_SET_NAME=replicaset-shard" + shardIndex
                    ],
                    volumes: [
                        "./burni-mongodb-sharded/shard" + shardIndex + "-primary-data:/bitnami"
                    ]
                },
                _b);
            composeConfig.services = __assign(__assign({}, composeConfig.services), shardPrimaryYaml);
            var secondaryYamlConfigList = this.getShardSecondaryNodesYamlConfig(shardConfig, shardIndex);
            for (var i = 0; i < secondaryYamlConfigList.length; i++) {
                composeConfig.services = __assign(__assign({}, composeConfig.services), secondaryYamlConfigList[i]);
            }
            this.addArbiterYamlConfig(composeConfig, shardConfig, shardIndex);
            shardIndex++;
        }
        var yamlStr = yaml.dump(composeConfig);
        return yamlStr;
    };
    MongoShardGenerator.prototype.getShardSecondaryNodesYamlConfig = function (shardConfig, shardIndex) {
        var _a;
        var yamlConfigList = [];
        for (var i = 0; i < shardConfig.secondaryCount; i++) {
            var secondaryNodeYaml = (_a = {},
                _a[this.generatorYamlConfig.projectName + "-mongodb-shard" + shardIndex + "-secondary" + i] = {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    environment: [
                        "MONGODB_ADVERTISED_HOSTNAME=" + this.generatorYamlConfig.projectName + "-mongodb-shard" + shardIndex + "-secondary" + i,
                        "MONGODB_SHARDING_MODE=shardsvr",
                        "MONGODB_MONGOS_HOST=" + this.generatorYamlConfig.projectName + "-mongodb-mongos",
                        "MONGODB_INITIAL_PRIMARY_HOST=" + this.generatorYamlConfig.projectName + "-mongodb-shard" + shardIndex + "-primary",
                        "MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017",
                        "MONGODB_INITIAL_PRIMARY_ROOT_PASSWORD=" + this.mongosInstance.config.mongos.rootPassword,
                        "MONGODB_REPLICA_SET_MODE=secondary",
                        "MONGODB_REPLICA_SET_KEY=" + this.mongosInstance.config.mongos.replicaSetKey,
                        "MONGODB_REPLICA_SET_NAME=replicaset-shard" + shardIndex
                    ],
                    volumes: [
                        "./burni-mongodb-sharded/shard" + shardIndex + "-secondary" + i + "-data:/bitnami"
                    ]
                },
                _a);
            yamlConfigList.push(secondaryNodeYaml);
        }
        return yamlConfigList;
    };
    MongoShardGenerator.prototype.addArbiterYamlConfig = function (composeConfig, shardConfig, shardIndex) {
        var _a;
        if (shardConfig.enableArbiter) {
            var arbiterYaml = (_a = {},
                _a[this.generatorYamlConfig.projectName + "-mongodb-shard" + shardIndex + "-arbiter"] = {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    environment: [
                        "MONGODB_ADVERTISED_HOSTNAME=" + this.generatorYamlConfig.projectName + "-mongodb-shard" + shardIndex + "-arbiter",
                        "MONGODB_SHARDING_MODE=shardsvr",
                        "MONGODB_MONGOS_HOST=" + this.generatorYamlConfig.projectName + "-mongodb-mongos",
                        "MONGODB_INITIAL_PRIMARY_HOST=" + this.generatorYamlConfig.projectName + "-mongodb-shard" + shardIndex + "-primary",
                        "MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017",
                        "MONGODB_INITIAL_PRIMARY_ROOT_PASSWORD=" + this.mongosInstance.config.mongos.rootPassword,
                        "MONGODB_REPLICA_SET_MODE=arbiter",
                        "MONGODB_REPLICA_SET_KEY=" + this.mongosInstance.config.mongos.replicaSetKey,
                        "MONGODB_REPLICA_SET_NAME=replicaset-shard" + shardIndex
                    ],
                    volumes: [
                        "./burni-mongodb-sharded/shard" + shardIndex + "-arbiter-data:/bitnami"
                    ]
                },
                _a);
            composeConfig.services = __assign(__assign({}, composeConfig.services), arbiterYaml);
        }
    };
    MongoShardGenerator.prototype.addCfgYamlConfig = function (composeConfig) {
        var _a, _b;
        var cfgPrimaryYaml = (_a = {},
            _a[this.generatorYamlConfig.projectName + "-mongodb-cfg-primary"] = {
                image: "docker.io/bitnami/mongodb-sharded:4.4",
                environment: [
                    "MONGODB_ADVERTISED_HOSTNAME=" + this.generatorYamlConfig.projectName + "-mongodb-cfg-primary",
                    "MONGODB_SHARDING_MODE=configsvr",
                    "MONGODB_ROOT_PASSWORD=" + this.mongosInstance.config.mongos.rootPassword,
                    "MONGODB_REPLICA_SET_MODE=primary",
                    "MONGODB_REPLICA_SET_KEY=" + this.mongosInstance.config.mongos.replicaSetKey,
                    "MONGODB_REPLICA_SET_NAME=replicaSet-cfg"
                ],
                volumes: [
                    "./burni-mongodb-sharded/cfg-data:/bitnami"
                ]
            },
            _a);
        composeConfig.services = __assign(__assign({}, composeConfig.services), cfgPrimaryYaml);
        for (var cfgCount = 0; cfgCount < this.mongosInstance.config.cfg.secondaryCount; cfgCount++) {
            var cfgSecondaryYaml = (_b = {},
                _b[this.generatorYamlConfig.projectName + "-mongodb-cfg-secondary" + cfgCount] = {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    environment: [
                        "MONGODB_ADVERTISED_HOSTNAME=" + this.generatorYamlConfig.projectName + "-mongodb-cfg-secondary" + cfgCount,
                        "MONGODB_SHARDING_MODE=configsvr",
                        "MONGODB_PRIMARY_HOST=" + this.generatorYamlConfig.projectName + "-mongodb-cfg-primary",
                        "MONGODB_PRIMARY_ROOT_PASSWORD=" + this.mongosInstance.config.mongos.rootPassword,
                        "MONGODB_REPLICA_SET_MODE=secondary",
                        "MONGODB_REPLICA_SET_KEY=" + this.mongosInstance.config.mongos.replicaSetKey,
                        "MONGODB_REPLICA_SET_NAME=replicaSet-cfg"
                    ],
                    volumes: [
                        "./burni-mongodb-sharded/cfg-data:/bitnami"
                    ]
                },
                _b);
            composeConfig.services = __assign(__assign({}, composeConfig.services), cfgSecondaryYaml);
        }
    };
    return MongoShardGenerator;
}());
exports.MongoShardGenerator = MongoShardGenerator;
