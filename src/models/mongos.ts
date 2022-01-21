export interface IMongosConfig {
    replicaSetKey: string; //MongoDB® replica set key. Length should be greater than 5 characters and should not contain any special characters. Required for all nodes in the sharded cluster. No default.
    rootPassword: string;
}