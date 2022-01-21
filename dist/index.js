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
    for (var shardIndex = 0; shardIndex < generatorConfig.shardCount; shardIndex++) {
        addGeneratorShardConfig(generatorConfig, mongosInstance, shardIndex);
    }
    var mongoShardGenerator = new mongoShardGenerator_1.MongoShardGenerator(generatorConfig, mongosInstance);
    var yamlConfig = mongoShardGenerator.generateYamlConfig();
    return yamlConfig;
}
exports.generateMongoDBShardYamlConfig = generateMongoDBShardYamlConfig;
function addGeneratorShardConfig(generatorConfig, mongosInstance, index) {
    if (generatorConfig.useSameShardConfig) {
        mongosInstance.addShard(mongosInstance.config.shards[0]);
    }
    else {
        mongosInstance.addShard(mongosInstance.config.shards[index]);
    }
}
