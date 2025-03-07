import {
  type DescMethod,
  create,
  fromBinary,
  toBinary,
} from '@bufbuild/protobuf';
import type {
  GenService,
  GenServiceMethods,
} from '@bufbuild/protobuf/codegenv1';
import type * as grpc from '@grpc/grpc-js';

export type GrpcServiceDefinition<TRuntimeShape extends GenServiceMethods> = {
  [K in keyof GenService<TRuntimeShape>['method']]: grpc.MethodDefinition<
    GenService<TRuntimeShape>['method'][K]['input'],
    GenService<TRuntimeShape>['method'][K]['output']
  >;
};

function createMethodDefinition(
  method: DescMethod,
): grpc.MethodDefinition<any, any> {
  return {
    path: `/${method.parent.typeName}/${method.name}`,
    originalName: method.name,
    requestStream:
      method.methodKind === 'client_streaming' ||
      method.methodKind === 'bidi_streaming',
    responseStream:
      method.methodKind === 'server_streaming' ||
      method.methodKind === 'bidi_streaming',
    requestSerialize(value: unknown): Buffer {
      const message = create(method.input, value as never);
      return Buffer.from(toBinary(method.input, message));
    },
    requestDeserialize(bytes: Buffer): unknown {
      return fromBinary(method.input, bytes);
    },
    responseSerialize(value: unknown): Buffer {
      const message = create(method.output, value as never);
      return Buffer.from(toBinary(method.output, message));
    },
    responseDeserialize(bytes: Buffer): unknown {
      return fromBinary(method.output, bytes);
    },
  };
}

export function createGrpcServiceDefinition<
  TRuntimeShape extends GenServiceMethods,
>(service: GenService<TRuntimeShape>): GrpcServiceDefinition<TRuntimeShape> {
  const definition: Record<string, grpc.MethodDefinition<any, any>> = {};

  for (const method of service.methods) {
    definition[method.localName] = createMethodDefinition(method);
  }

  return definition as GrpcServiceDefinition<TRuntimeShape>;
}
