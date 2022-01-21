import { ICfgConfig } from "./models/cfg";
import { IMongosConfig } from "./models/mongos";
import { IShardConfig } from "./models/shard";
export interface IInstanceConfig {
    mongos: IMongosConfig;
    shards: Array<IShardConfig>;
    cfg: ICfgConfig;
}
export declare class MongosInstance {
    config: IInstanceConfig;
    constructor(mongosConfig: IMongosConfig);
    addShard(shardConfig: IShardConfig): void;
}
