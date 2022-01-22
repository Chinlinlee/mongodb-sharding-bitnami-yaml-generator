import { IDockerComposeYaml, IGeneratorConfig } from "./generator";
import { IShardConfig } from "./shard";
import { MongosInstance } from "./mongosInstance";
import * as yaml from 'js-yaml';

export class MongoShardGenerator {
    generatorYamlConfig: IGeneratorConfig = {
        projectName: "",
        shardCount: 1 ,
        useSameShardConfig: true
    };
    mongosInstance: MongosInstance = null as unknown as MongosInstance;
    private prefixProjectName: string = "";
    constructor(iGeneratorYamlConfig: IGeneratorConfig, iMongosInstance: MongosInstance) {
        this.generatorYamlConfig = {...iGeneratorYamlConfig};
        this.mongosInstance = iMongosInstance;
    }
    generateYamlConfig () {
        let composeConfig = {
            version: "3.4",
            services: {}
        };
        this.prefixProjectName = this.generatorYamlConfig.projectName ? `${this.generatorYamlConfig.projectName}-` : "";
        let mongosYaml = {
            [`${this.prefixProjectName}mongodb-mongos`]: {
                image: "docker.io/bitnami/mongodb-sharded:4.4",
                container_name: `${this.prefixProjectName}mongodb-mongos`,
                environment: [
                    `MONGODB_ADVERTISED_HOSTNAME=${this.prefixProjectName}mongodb-mongos`,
                    `MONGODB_SHARDING_MODE=mongos`,
                    `MONGODB_CFG_PRIMARY_HOST=${this.prefixProjectName}mongodb-cfg-primary`,
                    `MONGODB_CFG_REPLICA_SET_NAME=${this.prefixProjectName}replicaSet-cfg`,
                    `MONGODB_REPLICA_SET_KEY=${this.mongosInstance.config.mongos.replicaSetKey}`,
                    `MONGODB_ROOT_PASSWORD=${this.mongosInstance.config.mongos.rootPassword}`
                ],
                volumes: [
                    `./${this.prefixProjectName}mongodb-shard/mongos-data:/bitnami`
                ],
                ports: [
                    `27017:27017`
                ]
            } 
        };
        composeConfig.services = {
            ...composeConfig.services,
            ...mongosYaml
        };

        this.addCfgYamlConfig(composeConfig);

        let shardIndex = 0;
        for (let shardConfig of this.mongosInstance.config.shards) {
            let shardPrimaryYaml = {
                [`${this.prefixProjectName}mongodb-shard${shardIndex}-primary`]: {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    container_name: `${this.prefixProjectName}mongodb-shard${shardIndex}-primary`,
                    environment: [
                        `MONGODB_ADVERTISED_HOSTNAME=${this.prefixProjectName}mongodb-shard${shardIndex}-primary`,
                        `MONGODB_SHARDING_MODE=shardsvr`,
                        `MONGODB_MONGOS_HOST=${this.prefixProjectName}mongodb-mongos`,
                        `MONGODB_ROOT_PASSWORD=${this.mongosInstance.config.mongos.rootPassword}`,
                        `MONGODB_REPLICA_SET_MODE=primary`,
                        `MONGODB_REPLICA_SET_KEY=${this.mongosInstance.config.mongos.replicaSetKey}`,
                        `MONGODB_REPLICA_SET_NAME=${this.prefixProjectName}replicaSet-shard${shardIndex}`
                    ],
                    volumes: [
                        `./${this.prefixProjectName}mongodb-shard/shard${shardIndex}-primary-data:/bitnami`
                    ]
                }
                
            };
            composeConfig.services = {
                ...composeConfig.services,
                ...shardPrimaryYaml
            };

            let secondaryYamlConfigList = this.getShardSecondaryNodesYamlConfig(shardConfig, shardIndex);
            for (let i = 0 ; i < secondaryYamlConfigList.length ; i++) {
                composeConfig.services = {
                    ...composeConfig.services,
                    ...secondaryYamlConfigList[i]
                };
            }

            this.addArbiterYamlConfig(composeConfig, shardConfig, shardIndex);

            shardIndex++;
        }

        let yamlStr = yaml.dump(composeConfig);
        return yamlStr;
    }
    
    private getShardSecondaryNodesYamlConfig (shardConfig: IShardConfig , shardIndex: number) {
        let yamlConfigList = [];
        for (let i = 0 ; i < shardConfig.secondaryCount ; i++) {
            let secondaryNodeYaml = {
                [`${this.prefixProjectName}mongodb-shard${shardIndex}-secondary${i}`]: {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    container_name: `${this.prefixProjectName}mongodb-shard${shardIndex}-secondary${i}`,
                    environment: [
                        `MONGODB_ADVERTISED_HOSTNAME=${this.prefixProjectName}mongodb-shard${shardIndex}-secondary${i}`,
                        `MONGODB_SHARDING_MODE=shardsvr`,
                        `MONGODB_MONGOS_HOST=${this.prefixProjectName}mongodb-mongos`,
                        `MONGODB_INITIAL_PRIMARY_HOST=${this.prefixProjectName}mongodb-shard${shardIndex}-primary`,
                        `MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017`,
                        `MONGODB_INITIAL_PRIMARY_ROOT_PASSWORD=${this.mongosInstance.config.mongos.rootPassword}`,
                        `MONGODB_REPLICA_SET_MODE=secondary`,
                        `MONGODB_REPLICA_SET_KEY=${this.mongosInstance.config.mongos.replicaSetKey}`,
                        `MONGODB_REPLICA_SET_NAME=${this.prefixProjectName}replicaSet-shard${shardIndex}`
                    ],
                    volumes: [
                        `./${this.prefixProjectName}mongodb-shard/shard${shardIndex}-secondary${i}-data:/bitnami`
                    ]
                }
            }
            yamlConfigList.push(secondaryNodeYaml);
        }
        return yamlConfigList;
    }

    private addArbiterYamlConfig (composeConfig: IDockerComposeYaml,shardConfig: IShardConfig , shardIndex: number) {
        if (shardConfig.enableArbiter) {
            let arbiterYaml = {
                [`${this.prefixProjectName}mongodb-shard${shardIndex}-arbiter`]: {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    container_name: `${this.prefixProjectName}mongodb-shard${shardIndex}-arbiter`,
                    environment: [
                        `MONGODB_ADVERTISED_HOSTNAME=${this.prefixProjectName}mongodb-shard${shardIndex}-arbiter`,
                        `MONGODB_SHARDING_MODE=shardsvr`,
                        `MONGODB_MONGOS_HOST=${this.prefixProjectName}mongodb-mongos`,
                        `MONGODB_INITIAL_PRIMARY_HOST=${this.prefixProjectName}mongodb-shard${shardIndex}-primary`,
                        `MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017`,
                        `MONGODB_INITIAL_PRIMARY_ROOT_PASSWORD=${this.mongosInstance.config.mongos.rootPassword}`,
                        `MONGODB_REPLICA_SET_MODE=arbiter`,
                        `MONGODB_REPLICA_SET_KEY=${this.mongosInstance.config.mongos.replicaSetKey}`,
                        `MONGODB_REPLICA_SET_NAME=${this.prefixProjectName}replicaSet-shard${shardIndex}`
                    ],
                    volumes: [
                        `./${this.prefixProjectName}mongodb-shard/shard${shardIndex}-arbiter-data:/bitnami`
                    ]
                }
            }
            composeConfig.services = {
                ...composeConfig.services,
                ...arbiterYaml
            };
        }
    }

    private addCfgYamlConfig(composeConfig: IDockerComposeYaml) {
        let cfgPrimaryYaml = {
            [`${this.prefixProjectName}mongodb-cfg-primary`]: {
                image: "docker.io/bitnami/mongodb-sharded:4.4",
                container_name: `${this.prefixProjectName}mongodb-cfg-primary`,
                environment: [
                    `MONGODB_ADVERTISED_HOSTNAME=${this.prefixProjectName}mongodb-cfg-primary`,
                    `MONGODB_SHARDING_MODE=configsvr`,
                    `MONGODB_ROOT_PASSWORD=${this.mongosInstance.config.mongos.rootPassword}`,
                    `MONGODB_REPLICA_SET_MODE=primary`,
                    `MONGODB_REPLICA_SET_KEY=${this.mongosInstance.config.mongos.replicaSetKey}`,
                    `MONGODB_REPLICA_SET_NAME=${this.prefixProjectName}replicaSet-cfg`
                ],
                volumes: [
                    `./${this.prefixProjectName}mongodb-shard/cfg-data:/bitnami`
                ]
            }
        }
        composeConfig.services = {
            ...composeConfig.services,
            ...cfgPrimaryYaml
        }
        for (let cfgCount=0 ; cfgCount < this.mongosInstance.config.cfg.secondaryCount ; cfgCount++) {
            let cfgSecondaryYaml = {
                [`${this.prefixProjectName}mongodb-cfg-secondary${cfgCount}`]: {
                    image: "docker.io/bitnami/mongodb-sharded:4.4",
                    container_name: `${this.prefixProjectName}mongodb-cfg-secondary${cfgCount}`,
                    environment: [
                        `MONGODB_ADVERTISED_HOSTNAME=${this.prefixProjectName}mongodb-cfg-secondary${cfgCount}`,
                        `MONGODB_SHARDING_MODE=configsvr`,
                        `MONGODB_PRIMARY_HOST=${this.prefixProjectName}mongodb-cfg-primary`,
                        `MONGODB_PRIMARY_ROOT_PASSWORD=${this.mongosInstance.config.mongos.rootPassword}`,
                        `MONGODB_REPLICA_SET_MODE=secondary`,
                        `MONGODB_REPLICA_SET_KEY=${this.mongosInstance.config.mongos.replicaSetKey}`,
                        `MONGODB_REPLICA_SET_NAME=${this.prefixProjectName}replicaSet-cfg`
                    ],
                    volumes: [
                        `./${this.prefixProjectName}mongodb-shard/cfg-data:/bitnami`
                    ]
                }
            }
            composeConfig.services = {
                ...composeConfig.services,
                ...cfgSecondaryYaml
            }
        }
        
    }

}
