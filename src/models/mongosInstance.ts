import { ICfgConfig } from "./cfg";
import { IMongosConfig } from "./mongos";
import { IShardConfig } from "./shard";


export interface IInstanceConfig {
    mongos: IMongosConfig;
    shards: Array<IShardConfig>;
    cfg : ICfgConfig;
}

export class MongosInstance {
    config: IInstanceConfig = {
        mongos: {
            replicaSetKey: "",
            rootPassword: ""
        } ,
        shards: [] ,
        cfg: {
            secondaryCount: 0
        }
    };
    constructor(instanceConfig: IInstanceConfig) {
        if (!instanceConfig.mongos.replicaSetKey || 
            !instanceConfig.mongos.rootPassword) {
            throw Error("missing replicaSetKey or rootPassword in mongosConfig");
        }
        this.config = {...instanceConfig};
    }

    public addShard (shardConfig: IShardConfig) {
        this.config.shards.push({...shardConfig});
    }

}