import { ICfgConfig } from "./cfg";
import { IMongosConfig } from "./mongos";
import { IShardConfig } from "./shard";
export interface IInstanceConfig {
    mongos: IMongosConfig;
    shards: Array<IShardConfig>;
    cfg: ICfgConfig;
}
export declare class MongosInstance {
    config: IInstanceConfig;
    constructor(instanceConfig: IInstanceConfig);
    addShard(shardConfig: IShardConfig): void;
}
