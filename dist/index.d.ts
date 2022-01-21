import { IGeneratorConfig } from './models/generator';
import { IInstanceConfig } from './models/mongosInstance';
declare function generateMongoDBShardYamlConfig(generatorConfig: IGeneratorConfig, instanceConfig: IInstanceConfig): string;
export { generateMongoDBShardYamlConfig };
