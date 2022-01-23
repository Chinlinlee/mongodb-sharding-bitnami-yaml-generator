#!/usr/bin/env node
const { Command } = require('commander');
const { IInstanceConfig, MongosInstance } = require('../dist/models/mongosInstance');
const { IGeneratorConfig } = require('../dist/models/generator');
const { generateMongoDBShardYamlConfig } = require('../dist/index');
const fs = require('fs');
const path = require('path');

/** @type {IInstanceConfig} */
let instanceConfig = {
    mongos: {
        replicaSetKey: "replicaSet123",
        rootPassword: "password"
    },
    shards: [
        {
            secondaryCount: 1,
            enableArbiter: true
        }
    ],
    cfg: {
        secondaryCount: 0
    }
};

/** @type {IGeneratorConfig} */
let generatorConfig = {
    projectName: "",
    shardCount: 1,
    useSameShardConfig: true
};

const program = new Command();
program.version("1.0.0");

program.requiredOption("-c, --config <string>" ,"input config file path (required)");
program.requiredOption("-o, --output <string>" ,"output file path (required)");
program.parse();
const opts = program.opts();
let fileFullPath= "";
if (path.isAbsolute(opts.config)) {
    fileFullPath = opts.config;
} else {
    fileFullPath = path.join(process.cwd(), opts.config);
}

let configStr = fs.readFileSync(fileFullPath , {encoding: 'utf8'});
let configJson = JSON.parse(configStr);

if (configJson["generator"]) {
    generatorConfig = {
        ...generatorConfig,
        ...configJson["generator"]
    };
}

if (configJson["mongos"]) {
    instanceConfig.mongos = {
        ...instanceConfig.mongos,
        ...configJson["mongos"]
    };
}
if (configJson["shards"]) {
    instanceConfig.shards = [...configJson["shards"]];
}
if (configJson["cfg"]) {
    instanceConfig.cfg = {
        ...instanceConfig.cfg,
        ...configJson["cfg"]
    };
}

let outputFilePath = "";
if (path.isAbsolute(opts.output)) {
    outputFilePath = opts.output;
} else {
    outputFilePath = path.join(process.cwd(), opts.output);
}
let yamlStr = generateMongoDBShardYamlConfig(generatorConfig, instanceConfig);
try {
    fs.writeFileSync(outputFilePath, yamlStr);
    console.log(`generate yaml config file successfully at ${outputFilePath}`);
} catch(e) {
    console.error(e);
}



