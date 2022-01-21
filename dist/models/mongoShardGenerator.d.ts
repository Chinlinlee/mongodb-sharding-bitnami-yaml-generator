import { IGeneratorConfig } from "./generator";
import { MongosInstance } from "./mongosInstance";
export declare class MongoShardGenerator {
    generatorYamlConfig: IGeneratorConfig;
    mongosInstance: MongosInstance;
    private prefixProjectName;
    constructor(iGeneratorYamlConfig: IGeneratorConfig, iMongosInstance: MongosInstance);
    generateYamlConfig(): string;
    private getShardSecondaryNodesYamlConfig;
    private addArbiterYamlConfig;
    private addCfgYamlConfig;
}
