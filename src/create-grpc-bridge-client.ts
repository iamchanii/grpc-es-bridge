import type {
  GenService,
  GenServiceMethods,
} from '@bufbuild/protobuf/codegenv1';
import type { GenMessage } from '@bufbuild/protobuf/codegenv1';
import * as grpc from '@grpc/grpc-js';
import {
  type GrpcServiceDefinition,
  createGrpcServiceDefinition,
} from './grpc-service-definition.js';

interface UnaryRpcMethod<TRequest, TResponse> {
  (
    request: TRequest,
    callback: (error: grpc.ServiceError | null, response: TResponse) => void,
  ): grpc.ClientUnaryCall;
  (
    request: TRequest,
    metadata: grpc.Metadata,
    callback: (error: grpc.ServiceError | null, response: TResponse) => void,
  ): grpc.ClientUnaryCall;
  (
    request: TRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (error: grpc.ServiceError | null, response: TResponse) => void,
  ): grpc.ClientUnaryCall;
}

type InferGenMessage<T> = T extends GenMessage<infer U> ? U : never;

type UnaryRpcMethods<TRuntimeShape extends GenServiceMethods> = {
  [MethodName in keyof TRuntimeShape]: UnaryRpcMethod<
    InferGenMessage<TRuntimeShape[MethodName]['input']>,
    InferGenMessage<TRuntimeShape[MethodName]['output']>
  >;
};

type GrpcBridgeClient<TRuntimeShape extends GenServiceMethods> = grpc.Client &
  UnaryRpcMethods<TRuntimeShape>;

type GrpcBridgeClientConstructor<TRuntimeShape extends GenServiceMethods> = {
  new (
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: Partial<grpc.ClientOptions>,
  ): GrpcBridgeClient<TRuntimeShape>;
  service: GrpcServiceDefinition<TRuntimeShape>;
  serviceName: string;
};

export function createGrpcBridgeClient<TRuntimeShape extends GenServiceMethods>(
  service: GenService<TRuntimeShape>,
): GrpcBridgeClientConstructor<TRuntimeShape> {
  const grpcDefinitions = createGrpcServiceDefinition(service);

  return grpc.makeGenericClientConstructor(
    grpcDefinitions,
    service.typeName,
  ) as GrpcBridgeClientConstructor<TRuntimeShape>;
}
