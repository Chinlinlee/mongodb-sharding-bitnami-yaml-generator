import { IGeneratorConfig } from "./models/generator";
import { MongosInstance } from "./mongosInstance";
export declare class MongoShardGenerator {
    generatorYamlConfig: IGeneratorConfig;
    mongosInstance: MongosInstance;
    constructor(iGeneratorYamlConfig: IGeneratorConfig, iMongosInstance: MongosInstance);
    generateYamlConfig(): string;
    private getShardSecondaryNodesYamlConfig;
    private addArbiterYamlConfig;
    private addCfgYamlConfig;
}
