# mongodb-sharding-bitnami-yaml-generator
generate [bitnami/mongodb-sharded](https://hub.docker.com/r/bitnami/mongodb-sharded) docker-compose.yaml file

## Installation
### Global package
If you want to use in command line.
```
npm i -g mongodb-sharding-bitnami-yaml-generator
```
### Project package
If you want to use in node.js.
```
npm i mongodb-sharding-bitnami-yaml-generator
```

## Usage
### Configuration
- You can refer to `examples.config.json` file to configure.
- The file need to be json file.
```
{
    "generator": {
        "projectName": "", //The project name, use to generator docker-compose service name, e.g. `hello` will generate `hello-mongodb-monogos`. When empty string will generate `mongodb-mongos`
        "shardCount": 1,
        "useSameShardConfig": true //When true, every shards use first configuration. Otherwise will detect `shards` length is same to `shardCount`, this mean that you need to config every shards,respectively.
    },
    "mongos": {
        "replicaSetKey": "replicaSet123",
        "rootPassword": "password"
    },
    "shards": [
        {
            "secondaryCount": 1,
            "enableArbiter": true
        }
    ],
    "cfg": {
        "secondaryCount": 0
    }
}
```
### Command line
```
Usage: mongodb-sharding-bitnami-yaml-generator [options]

Options:
  -V, --version          output the version number
  -c, --config <string>  input config file path (required)
  -o, --output <string>  output file path (required)
  -h, --help             display help for command
```

### Node.js
```
const { generateMongoDBShardYamlConfig } = require('mongodb-sharding-bitnami-yaml-generator')

let yamlStr = generateMongoDBShardYamlConfig({
    projectName: "",
    shardCount: 2,
    useSameShardConfig: false
} ,{
    mongos: {
        replicaSetKey: "replicaSet123",
        rootPassword: "password"
    },
    shards: [
        {
            secondaryCount: 2,
            enableArbiter: true
        }
    ] ,
    cfg : {
        secondaryCount: 0
    }
});
console.log(yamlStr);
```

## Example Generated docker-compose.yaml
```
version: '3.4'
services:
  mongodb-mongos:
    image: docker.io/bitnami/mongodb-sharded:4.4
    environment:
      - MONGODB_ADVERTISED_HOSTNAME=mongodb-mongos
      - MONGODB_SHARDING_MODE=mongos
      - MONGODB_CFG_PRIMARY_HOST=mongodb-cfg-primary
      - MONGODB_CFG_REPLICA_SET_NAME=replicaSet-cfg
      - MONGODB_REPLICA_SET_KEY=replicaSet123
      - MONGODB_ROOT_PASSWORD=password
    volumes:
      - ./mongodb-shard/mongos-data:/bitnami
    ports:
      - '27017:27017'
  mongodb-cfg-primary:
    image: docker.io/bitnami/mongodb-sharded:4.4
    environment:
      - MONGODB_ADVERTISED_HOSTNAME=mongodb-cfg-primary
      - MONGODB_SHARDING_MODE=configsvr
      - MONGODB_ROOT_PASSWORD=password
      - MONGODB_REPLICA_SET_MODE=primary
      - MONGODB_REPLICA_SET_KEY=replicaSet123
      - MONGODB_REPLICA_SET_NAME=replicaSet-cfg
    volumes:
      - ./mongodb-shard/cfg-data:/bitnami
  mongodb-shard0-primary:
    image: docker.io/bitnami/mongodb-sharded:4.4
    environment:
      - MONGODB_ADVERTISED_HOSTNAME=mongodb-shard0-primary
      - MONGODB_SHARDING_MODE=shardsvr
      - MONGODB_MONGOS_HOST=mongodb-mongos
      - MONGODB_ROOT_PASSWORD=password
      - MONGODB_REPLICA_SET_MODE=primary
      - MONGODB_REPLICA_SET_KEY=replicaSet123
      - MONGODB_REPLICA_SET_NAME=replicaSet-shard0
    volumes:
      - ./mongodb-shard/shard0-primary-data:/bitnami
  mongodb-shard0-secondary0:
    image: docker.io/bitnami/mongodb-sharded:4.4
    environment:
      - MONGODB_ADVERTISED_HOSTNAME=mongodb-shard0-secondary0
      - MONGODB_SHARDING_MODE=shardsvr
      - MONGODB_MONGOS_HOST=mongodb-mongos
      - MONGODB_INITIAL_PRIMARY_HOST=mongodb-shard0-primary
      - MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017
      - MONGODB_INITIAL_PRIMARY_ROOT_PASSWORD=password
      - MONGODB_REPLICA_SET_MODE=secondary
      - MONGODB_REPLICA_SET_KEY=replicaSet123
      - MONGODB_REPLICA_SET_NAME=replicaSet-shard0
    volumes:
      - ./mongodb-shard/shard0-secondary0-data:/bitnami
  mongodb-shard0-arbiter:
    image: docker.io/bitnami/mongodb-sharded:4.4
    environment:
      - MONGODB_ADVERTISED_HOSTNAME=mongodb-shard0-arbiter
      - MONGODB_SHARDING_MODE=shardsvr
      - MONGODB_MONGOS_HOST=mongodb-mongos
      - MONGODB_INITIAL_PRIMARY_HOST=mongodb-shard0-primary
      - MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017
      - MONGODB_INITIAL_PRIMARY_ROOT_PASSWORD=password
      - MONGODB_REPLICA_SET_MODE=arbiter
      - MONGODB_REPLICA_SET_KEY=replicaSet123
      - MONGODB_REPLICA_SET_NAME=replicaSet-shard0
    volumes:
      - ./mongodb-shard/shard0-arbiter-data:/bitnami
  mongodb-shard1-primary:
    image: docker.io/bitnami/mongodb-sharded:4.4
    environment:
      - MONGODB_ADVERTISED_HOSTNAME=mongodb-shard1-primary
      - MONGODB_SHARDING_MODE=shardsvr
      - MONGODB_MONGOS_HOST=mongodb-mongos
      - MONGODB_ROOT_PASSWORD=password
      - MONGODB_REPLICA_SET_MODE=primary
      - MONGODB_REPLICA_SET_KEY=replicaSet123
      - MONGODB_REPLICA_SET_NAME=replicaSet-shard1
    volumes:
      - ./mongodb-shard/shard1-primary-data:/bitnami
  mongodb-shard1-secondary0:
    image: docker.io/bitnami/mongodb-sharded:4.4
    environment:
      - MONGODB_ADVERTISED_HOSTNAME=mongodb-shard1-secondary0
      - MONGODB_SHARDING_MODE=shardsvr
      - MONGODB_MONGOS_HOST=mongodb-mongos
      - MONGODB_INITIAL_PRIMARY_HOST=mongodb-shard1-primary
      - MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017
      - MONGODB_INITIAL_PRIMARY_ROOT_PASSWORD=password
      - MONGODB_REPLICA_SET_MODE=secondary
      - MONGODB_REPLICA_SET_KEY=replicaSet123
      - MONGODB_REPLICA_SET_NAME=replicaSet-shard1
    volumes:
      - ./mongodb-shard/shard1-secondary0-data:/bitnami
  mongodb-shard1-arbiter:
    image: docker.io/bitnami/mongodb-sharded:4.4
    environment:
      - MONGODB_ADVERTISED_HOSTNAME=mongodb-shard1-arbiter
      - MONGODB_SHARDING_MODE=shardsvr
      - MONGODB_MONGOS_HOST=mongodb-mongos
      - MONGODB_INITIAL_PRIMARY_HOST=mongodb-shard1-primary
      - MONGODB_INITIAL_PRIMARY_PORT_NUMBER=27017
      - MONGODB_INITIAL_PRIMARY_ROOT_PASSWORD=password
      - MONGODB_REPLICA_SET_MODE=arbiter
      - MONGODB_REPLICA_SET_KEY=replicaSet123
      - MONGODB_REPLICA_SET_NAME=replicaSet-shard1
    volumes:
      - ./mongodb-shard/shard1-arbiter-data:/bitnami
```