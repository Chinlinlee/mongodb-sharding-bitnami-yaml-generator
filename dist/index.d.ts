import { IGeneratorConfig, IGenerateResult } from './models/generator';
import { IInstanceConfig } from './models/mongosInstance';
declare function generateMongoDBShardYamlConfig(generatorConfig: IGeneratorConfig, instanceConfig: IInstanceConfig): IGenerateResult;
export { generateMongoDBShardYamlConfig };
