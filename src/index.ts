import { IGeneratorConfig } from './models/generator';
import { IInstanceConfig, MongosInstance } from './models/mongosInstance';
import { MongoShardGenerator } from './models/mongoShardGenerator';

function generateMongoDBShardYamlConfig(generatorConfig: IGeneratorConfig, instanceConfig: IInstanceConfig): string {
    if (!generatorConfig.useSameShardConfig && instanceConfig.shards.length!==generatorConfig.shardCount) throw new Error("The count of shard config is not same to generator count when config generatorConfig.useSameShardConfig=false");

    if (instanceConfig.shards.length == 0) {
        instanceConfig.shards = [
            {
                secondaryCount: 1,
                enableArbiter: true
            }
        ];
    }
    
    let mongosInstance = new MongosInstance(instanceConfig);
    if (generatorConfig.useSameShardConfig) {
        addGeneratorShardConfig(generatorConfig, mongosInstance);
    }
    let mongoShardGenerator: MongoShardGenerator = new MongoShardGenerator( generatorConfig, mongosInstance);
    let yamlConfig = mongoShardGenerator.generateYamlConfig();
    return yamlConfig;
}

function addGeneratorShardConfig(generatorConfig: IGeneratorConfig, mongosInstance: MongosInstance) {
    for (let shardIndex = 1 ; shardIndex < generatorConfig.shardCount; shardIndex++) {
        if (mongosInstance.config.shards[shardIndex]) {
            mongosInstance.config.shards[shardIndex] = mongosInstance.config.shards[0];
        } else {
            mongosInstance.addShard(mongosInstance.config.shards[0]);
        }
    }
}

export {
    generateMongoDBShardYamlConfig
}
