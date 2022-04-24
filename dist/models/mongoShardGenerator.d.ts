import { IGeneratorConfig, IGenerateResult } from "./generator";
import { MongosInstance } from "./mongosInstance";
export declare class MongoShardGenerator {
    generatorYamlConfig: IGeneratorConfig;
    mongosInstance: MongosInstance;
    private prefixProjectName;
    result: IGenerateResult;
    constructor(iGeneratorYamlConfig: IGeneratorConfig, iMongosInstance: MongosInstance);
    generateYamlConfig(): string;
    private getShardSecondaryNodesYamlConfig;
    private addArbiterYamlConfig;
    private addCfgYamlConfig;
}
