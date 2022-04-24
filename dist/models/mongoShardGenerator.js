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
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
            shardCount: 1,
            useSameShardConfig: true
        };
        this.mongosInstance = null;
        this.prefixProjectName = "";
        this.result = {
            "mkdirScript": "",
            "yamlStr": ""
        };
        this.generatorYamlConfig = __assign({}, iGeneratorYamlConfig);
        this.mongosInstance = iMongosInstance;
    }
    MongoShardGenerator.prototype.generateYamlConfig = function () {
        var _a, _b;
        var composeConfig = {
            version: "3.4",
            services: {}
        };
        this.result.mkdirScript = "#!/bin/bash\r\n";
        this.prefixProjectName = this.generatorYamlConfig.projectName ? "".concat(this.generatorYamlConfig.projectName, "-") : "";
        var mongosYaml = (_a = {},
            _a["".concat(this.prefixProjectName, "mongodb-mongos")] = {
                image: "docker.io/bitnami/mongodb-sharded:4.4",
                container_name: "".concat(this.prefixProjectName, "mongodb-mongos"),
                environment: [
                    "MONGODB_ADVERTISED_HOSTNAME=".concat(this.prefixProjectName, "mongodb-mongos"),
                    "MONGODB_SHARDING_MODE=mongos",
                    "MONGODB_CFG_PRIMARY_HOST=".concat(this.prefixProjectName, "mongodb-cfg-primary"),
                    "MONGODB_CFG_REPLICA_SET_NAME=".concat(this.prefixProjectName, "replicaSet-cfg"),
                    "MONGODB_REPLICA_SET_KEY=".concat(this.mongosInstance.config.mongos.replicaSetKey),
                    "MONGODB_ROOT_PASSWORD=".concat(this.mongosInstance.config.mongos.rootPassword)
                ],
                volumes: [
                    "./".concat(this.prefixProjectName, "mongodb-shard/mongos-data:/bitnami")
                ],
                ports: [
                    "27017:27017"
                ]
            },
            _a);
        this.result.mkdirScript += "mkdir -p ./".concat(this.prefixProjectName, "mongodb-shard/mongos-data/mongodb/data/db\r\n");
        composeConfig.services = __assign(__assign({}, composeConfig.services), mongosYaml);
        this.addCfgYamlConfig(composeConfig);
        var shardIndex = 0;
        for (var _i = 0, _c = this.mongosInstance.config.shards; _i < _c.length; _i++) {
            var shardConfig = _c[_i];
            var shardPrimaryYaml = (_b = {},
                _b["".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-primary")] = {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    container_name: "".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-primary"),
                    environment: [
                        "MONGODB_ADVERTISED_HOSTNAME=".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-primary"),
                        "MONGODB_SHARDING_MODE=shardsvr",
                        "MONGODB_MONGOS_HOST=".concat(this.prefixProjectName, "mongodb-mongos"),
                        "MONGODB_ROOT_PASSWORD=".concat(this.mongosInstance.config.mongos.rootPassword),
                        "MONGODB_REPLICA_SET_MODE=primary",
                        "MONGODB_REPLICA_SET_KEY=".concat(this.mongosInstance.config.mongos.replicaSetKey),
                        "MONGODB_REPLICA_SET_NAME=".concat(this.prefixProjectName, "replicaSet-shard").concat(shardIndex)
                    ],
                    volumes: [
                        "./".concat(this.prefixProjectName, "mongodb-shard/shard").concat(shardIndex, "-primary-data:/bitnami")
                    ]
                },
                _b);
            this.result.mkdirScript += "mkdir -p ./".concat(this.prefixProjectName, "mongodb-shard/shard").concat(shardIndex, "-primary-data/mongodb/data/db\r\n");
            composeConfig.services = __assign(__assign({}, composeConfig.services), shardPrimaryYaml);
            var secondaryYamlConfigList = this.getShardSecondaryNodesYamlConfig(shardConfig, shardIndex);
            for (var i = 0; i < secondaryYamlConfigList.length; i++) {
                composeConfig.services = __assign(__assign({}, composeConfig.services), secondaryYamlConfigList[i]);
            }
            this.addArbiterYamlConfig(composeConfig, shardConfig, shardIndex);
            shardIndex++;
        }
        var yamlStr = yaml.dump(composeConfig);
        this.result.yamlStr = yamlStr;
        return yamlStr;
    };
    MongoShardGenerator.prototype.getShardSecondaryNodesYamlConfig = function (shardConfig, shardIndex) {
        var _a;
        var yamlConfigList = [];
        for (var i = 0; i < shardConfig.secondaryCount; i++) {
            var secondaryNodeYaml = (_a = {},
                _a["".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-secondary").concat(i)] = {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    container_name: "".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-secondary").concat(i),
                    environment: [
                        "MONGODB_ADVERTISED_HOSTNAME=".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-secondary").concat(i),
                        "MONGODB_SHARDING_MODE=shardsvr",
                        "MONGODB_MONGOS_HOST=".concat(this.prefixProjectName, "mongodb-mongos"),
                        "MONGODB_INITIAL_PRIMARY_HOST=".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-primary"),
                        "MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017",
                        "MONGODB_INITIAL_PRIMARY_ROOT_PASSWORD=".concat(this.mongosInstance.config.mongos.rootPassword),
                        "MONGODB_REPLICA_SET_MODE=secondary",
                        "MONGODB_REPLICA_SET_KEY=".concat(this.mongosInstance.config.mongos.replicaSetKey),
                        "MONGODB_REPLICA_SET_NAME=".concat(this.prefixProjectName, "replicaSet-shard").concat(shardIndex)
                    ],
                    volumes: [
                        "./".concat(this.prefixProjectName, "mongodb-shard/shard").concat(shardIndex, "-secondary").concat(i, "-data:/bitnami")
                    ]
                },
                _a);
            this.result.mkdirScript += "mkdir -p ./".concat(this.prefixProjectName, "mongodb-shard/shard").concat(shardIndex, "-secondary").concat(i, "-data/mongodb/data/db\r\n");
            yamlConfigList.push(secondaryNodeYaml);
        }
        return yamlConfigList;
    };
    MongoShardGenerator.prototype.addArbiterYamlConfig = function (composeConfig, shardConfig, shardIndex) {
        var _a;
        if (shardConfig.enableArbiter) {
            var arbiterYaml = (_a = {},
                _a["".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-arbiter")] = {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    container_name: "".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-arbiter"),
                    environment: [
                        "MONGODB_ADVERTISED_HOSTNAME=".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-arbiter"),
                        "MONGODB_SHARDING_MODE=shardsvr",
                        "MONGODB_MONGOS_HOST=".concat(this.prefixProjectName, "mongodb-mongos"),
                        "MONGODB_INITIAL_PRIMARY_HOST=".concat(this.prefixProjectName, "mongodb-shard").concat(shardIndex, "-primary"),
                        "MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017",
                        "MONGODB_INITIAL_PRIMARY_ROOT_PASSWORD=".concat(this.mongosInstance.config.mongos.rootPassword),
                        "MONGODB_REPLICA_SET_MODE=arbiter",
                        "MONGODB_REPLICA_SET_KEY=".concat(this.mongosInstance.config.mongos.replicaSetKey),
                        "MONGODB_REPLICA_SET_NAME=".concat(this.prefixProjectName, "replicaSet-shard").concat(shardIndex)
                    ],
                    volumes: [
                        "./".concat(this.prefixProjectName, "mongodb-shard/shard").concat(shardIndex, "-arbiter-data:/bitnami")
                    ]
                },
                _a);
            this.result.mkdirScript += "mkdir -p ./".concat(this.prefixProjectName, "mongodb-shard/shard").concat(shardIndex, "-arbiter-data/mongodb/data/db\r\n");
            composeConfig.services = __assign(__assign({}, composeConfig.services), arbiterYaml);
        }
    };
    MongoShardGenerator.prototype.addCfgYamlConfig = function (composeConfig) {
        var _a, _b;
        var cfgPrimaryYaml = (_a = {},
            _a["".concat(this.prefixProjectName, "mongodb-cfg-primary")] = {
                image: "docker.io/bitnami/mongodb-sharded:4.4",
                container_name: "".concat(this.prefixProjectName, "mongodb-cfg-primary"),
                environment: [
                    "MONGODB_ADVERTISED_HOSTNAME=".concat(this.prefixProjectName, "mongodb-cfg-primary"),
                    "MONGODB_SHARDING_MODE=configsvr",
                    "MONGODB_ROOT_PASSWORD=".concat(this.mongosInstance.config.mongos.rootPassword),
                    "MONGODB_REPLICA_SET_MODE=primary",
                    "MONGODB_REPLICA_SET_KEY=".concat(this.mongosInstance.config.mongos.replicaSetKey),
                    "MONGODB_REPLICA_SET_NAME=".concat(this.prefixProjectName, "replicaSet-cfg")
                ],
                volumes: [
                    "./".concat(this.prefixProjectName, "mongodb-shard/cfg-data:/bitnami")
                ]
            },
            _a);
        this.result.mkdirScript += "mkdir -p ./".concat(this.prefixProjectName, "mongodb-shard/cfg-data/mongodb/data/db\r\n");
        composeConfig.services = __assign(__assign({}, composeConfig.services), cfgPrimaryYaml);
        for (var cfgCount = 0; cfgCount < this.mongosInstance.config.cfg.secondaryCount; cfgCount++) {
            var cfgSecondaryYaml = (_b = {},
                _b["".concat(this.prefixProjectName, "mongodb-cfg-secondary").concat(cfgCount)] = {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    container_name: "".concat(this.prefixProjectName, "mongodb-cfg-secondary").concat(cfgCount),
                    environment: [
                        "MONGODB_ADVERTISED_HOSTNAME=".concat(this.prefixProjectName, "mongodb-cfg-secondary").concat(cfgCount),
                        "MONGODB_SHARDING_MODE=configsvr",
                        "MONGODB_PRIMARY_HOST=".concat(this.prefixProjectName, "mongodb-cfg-primary"),
                        "MONGODB_PRIMARY_ROOT_PASSWORD=".concat(this.mongosInstance.config.mongos.rootPassword),
                        "MONGODB_REPLICA_SET_MODE=secondary",
                        "MONGODB_REPLICA_SET_KEY=".concat(this.mongosInstance.config.mongos.replicaSetKey),
                        "MONGODB_REPLICA_SET_NAME=".concat(this.prefixProjectName, "replicaSet-cfg")
                    ],
                    volumes: [
                        "./".concat(this.prefixProjectName, "mongodb-shard/cfg-data:/bitnami")
                    ]
                },
                _b);
            this.result.mkdirScript += "mkdir -p ./".concat(this.prefixProjectName, "mongodb-shard/cfg-data/mongodb/data/db\r\n");
            composeConfig.services = __assign(__assign({}, composeConfig.services), cfgSecondaryYaml);
        }
    };
    return MongoShardGenerator;
}());
exports.MongoShardGenerator = MongoShardGenerator;
