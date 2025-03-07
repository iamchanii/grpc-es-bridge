# grpc-es-bridge

A lightweight adapter that bridges [protoc‑gen‑es](https://www.npmjs.com/package/@bufbuild/protoc-gen-es) generated stubs—designed for a [@connectrpc/connect](https://www.npmjs.com/package/@connectrpc/connect) runtime—with the [grpc‑js](https://www.npmjs.com/package/@grpc/grpc-js) implementation. This package is useful in scenarios when you need to send requests using grpc‑js with protoc‑gen‑es generated stubs.

## Overview

`grpc-es-bridge` provides a seamless integration layer between protoc‑gen‑es generated service stubs and the grpc‑js library. It enables you to leverage the type-safety and declarative client methods generated by protoc‑gen‑es while using grpc‑js to handle the underlying networking.

## Installation

```
npm install grpc-es-bridge
yarn add grpc-es-bridge
pnpm add grpc-es-bridge
bun add grpc-es-bridge
```

## Usage

Assuming you have a service definition generated by protoc‑gen‑es, you can create a client as follows:

```ts
import * as grpc from '@grpc/grpc-js';
import { createGrpcBridgeClient } from 'grpc-es-bridge';

// Import your generated service definition.
import { ElizaService } from './gen/proto/eliza_pb.js';
const ElizaServiceClient = createGrpcBridgeClient(ElizaService)

const address = 'localhost:50051';
const credentials = grpc.credentials.createInsecure();
const client = new ElizaServiceClient(address, credentials)

// Invoke a unary RPC method
client.say({ sentence: 'Hello, World!' }, (_error, response) => {
  console.log('Response:', response);
})
```

In some cases, you may prefer using a Promise-based approach for RPC calls instead of the callback-based pattern provided by grpc‑js. The grpc-es-bridge/connectrpc module offers a createConnectRpcClient function that creates a client similar to connectrpc's interface.

```ts
import * as grpc from '@grpc/grpc-js';
import { createConnectRpcClient } from 'grpc-es-bridge/connectrpc';

// Import your generated service definition.
import { ElizaService } from './gen/proto/eliza_pb.js';

// Set up the address and credentials for your gRPC server.
const address = 'localhost:50051';
const credentials = grpc.credentials.createInsecure();

// Create a connectrpc-style client.
const client = createConnectRpcClient(ElizaService, address, credentials);
const response = await client.say({ sentence: 'Hello, World!' })
console.log(client)
```

## License

MIT
