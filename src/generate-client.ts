import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
const CLASS_NAME = 'BitcoinClient';
const INTERFACE_NAME = 'BitcoinRpcService';

interface BitcoinMethods {
  [methodName: string]: Method;
}
interface Method {
  description: string;
  spec?: string;
  params: Params;
  result: Result;
}
interface Params {
  [param: string]: {
    type: string;
    required: boolean;
    description: string;
  };
}
interface Result {
  type: string;
  required: boolean;
  description: string;
}

const rawJson = readFileSync(join(__dirname, './bitcoin-methods.json'), 'utf8');
const bitcoinMethods: BitcoinMethods = JSON.parse(rawJson);
function main() {
  const methods: string[] = [];
  const records: string[] = [];

  // tslint:disable-next-line:forin
  for (const methodName in bitcoinMethods) {
    const { params, result, description } = bitcoinMethods[methodName];
    const [methodParams, rawParams] = makeMethodParams(params);
    methods.push(
      methodTemplate({
        mName: methodName,
        methodParams,
        rawParams,
        returnType: makeReturnType(result.type),
        mDescription: description,
      }),
    );
    records.push(interfaceRecordTemplate(methodName, params));
  }
  // Save the generated file
  writeFileSync(join(__dirname, './bitcoin-client.ts'), classTemplate(methods), {
    encoding: 'utf8',
  });
  writeFileSync(join(__dirname, './bitcoin-rpc-service.interface.ts'), interfaceTemplate(records), {
    encoding: 'utf8',
  });
}

function classTemplate(methods: string[]) {
  return `
  /**
   * AUTO-GENERATED FILE.  DO NOT MODIFY.
   *
   * This class was automatically generated.
   * It should not be modified by hand.
   */
    import { RpcClient, RpcClientOptions } from 'jsonrpc-ts';
    import { ${INTERFACE_NAME} } from './bitcoin-rpc-service.interface';
    export class ${CLASS_NAME} {
        private readonly rpcClient: RpcClient<${INTERFACE_NAME}>;
        constructor(readonly options: RpcClientOptions) {
            this.rpcClient = new RpcClient(options);
        }
        ${methods.join('\n')}
    }
    `;
}

function makeReturnType(returnType) {
  if (returnType.toString() === '[object Object]') {
    const returnTypeString = JSON.stringify(returnType);
    return returnTypeString.replace(/"/g, '');
  } else {
    return returnType;
  }
}

function methodTemplate({ mName, methodParams, rawParams, returnType, mDescription }) {
  return `
  /**
   * ${mDescription}
  */
    public async ${mName}(${methodParams}): Promise<${returnType}> {
        const res = await this.rpcClient.makeRequest<'${mName.toLowerCase()}', ${returnType}>({
            method: '${mName.toLowerCase()}',
            id: Date.now(),
            params: [${rawParams.join(', ')}],
            jsonrpc: '2.0',
        });
        // TODO: Handle Errors

        return res.data.result!;
    }
    `;
}

function interfaceRecordTemplate(methodName: string, params: Params) {
  const paramTypes: string[] = [];
  // tslint:disable-next-line:forin
  for (const param in params) {
    const currentParam = params[param];
    const formated = currentParam.required ? currentParam.type : currentParam.type.concat('?');
    paramTypes.push(formated);
  }
  return `${methodName.toLowerCase()}: [${paramTypes.join(', ')}]`;
}

function interfaceTemplate(records: string[]) {
  return `
  /**
   * AUTO-GENERATED FILE.  DO NOT MODIFY.
   *
   * This class was automatically generated.
   * It should not be modified by hand.
   */
    export interface ${INTERFACE_NAME} {
        ${records.join('\n')}
    }
    `;
}

function makeMethodParams(params: Params) {
  const formatedParams: string[] = [];
  const rawParams: string[] = [];
  // tslint:disable-next-line:forin
  for (const param in params) {
    const currentParam = params[param];
    rawParams.push(param);
    formatedParams.push(`${param}${currentParam.required ? '' : '?'}: ${currentParam.type}`);
  }
  return [formatedParams.join(', '), rawParams];
}
// Run The script
main();
