"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMongoDBShardYamlConfig = void 0;
var mongosInstance_1 = require("./models/mongosInstance");
var mongoShardGenerator_1 = require("./models/mongoShardGenerator");
function generateMongoDBShardYamlConfig(generatorConfig, instanceConfig) {
    if (!generatorConfig.useSameShardConfig && instanceConfig.shards.length !== generatorConfig.shardCount)
        throw new Error("The count of shard config is not same to generator count when config generatorConfig.useSameShardConfig=false");
    if (instanceConfig.shards.length == 0) {
        instanceConfig.shards = [
            {
                secondaryCount: 1,
                enableArbiter: true
            }
        ];
    }
    var mongosInstance = new mongosInstance_1.MongosInstance(instanceConfig);
    if (generatorConfig.useSameShardConfig) {
        addGeneratorShardConfig(generatorConfig, mongosInstance);
    }
    var mongoShardGenerator = new mongoShardGenerator_1.MongoShardGenerator(generatorConfig, mongosInstance);
    mongoShardGenerator.generateYamlConfig();
    return mongoShardGenerator.result;
}
exports.generateMongoDBShardYamlConfig = generateMongoDBShardYamlConfig;
function addGeneratorShardConfig(generatorConfig, mongosInstance) {
    for (var shardIndex = 1; shardIndex < generatorConfig.shardCount; shardIndex++) {
        if (mongosInstance.config.shards[shardIndex]) {
            mongosInstance.config.shards[shardIndex] = mongosInstance.config.shards[0];
        }
        else {
            mongosInstance.addShard(mongosInstance.config.shards[0]);
        }
    }
}
