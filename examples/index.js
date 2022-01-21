const { generateMongoDBShardYamlConfig } = require('../dist')


let yamlStr = generateMongoDBShardYamlConfig({
    projectName: "",
    shardCount: 2,
    useSameShardConfig: false
} ,{
    mongos: {
        replicaSetKey: "item",
        rootPassword: "123"
    },
    shards: [
        {
            secondaryCount: 2,
            enableArbiter: true
        }
    ] ,
    cfg : {
        secondaryCount: 0
    }
});
console.log(yamlStr);