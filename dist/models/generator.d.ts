export interface IGeneratorConfig {
    projectName: string;
    shardCount: number;
    useSameShardConfig: boolean;
}
export interface IDockerComposeYaml {
    version: string;
    services: Object;
}
