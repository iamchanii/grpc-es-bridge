import type {
  GenService,
  GenServiceMethods,
} from '@bufbuild/protobuf/codegenv1';
import type { Client } from '@connectrpc/connect';
import * as grpc from '@grpc/grpc-js';
import { createGrpcBridgeClient } from './create-grpc-bridge-client.js';

function convertHeadersToGrpcMetadata(headers?: HeadersInit) {
  const metadata = grpc.Metadata.fromHttp2Headers({});

  if (!headers) {
    return metadata;
  }

  if (headers instanceof Headers || Array.isArray(headers)) {
    for (const [key, value] of headers) {
      metadata.add(key, value);
    }

    return metadata;
  }

  for (const [key, value] of Object.entries(headers)) {
    metadata.add(key, value);
  }

  return metadata;
}

export function createConnectRpcClient<TRuntimeShape extends GenServiceMethods>(
  service: GenService<TRuntimeShape>,
  address: string,
  crendnetials: grpc.ChannelCredentials,
  options?: Partial<grpc.ClientOptions>,
): Client<GenService<TRuntimeShape>> {
  const ServiceClient = createGrpcBridgeClient(service);
  const client = new ServiceClient(address, crendnetials, options);

  const methods: Record<string, any> = {};

  for (const methodName of Object.keys(service.method)) {
    methods[methodName] = (request, options) => {
      return new Promise((resolve, reject) => {
        const grpcClientMethod = client[methodName].bind(client);
        const metadata = convertHeadersToGrpcMetadata(options?.headers);

        grpcClientMethod(
          request,
          metadata,
          (error: grpc.ServiceError | null, response: any) => {
            if (error) {
              reject(error);
              return;
            }

            resolve(response);
          },
        );
      });
    };
  }

  return methods as never;
}
