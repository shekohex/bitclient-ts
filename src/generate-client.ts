import { readFileSync, writeFileSync } from 'fs';
import * as JsonToTS from 'json-to-ts';
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
const fileImports: string[] = [];
const fileImportsIndex: string[] = [];
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
        returnType: makeReturnType(methodName, result.type),
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
  writeFileSync(join(__dirname, './interfaces/index.ts'), indexFileTemplate(fileImportsIndex), {
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
    import { ${fileImports.join(', ')} } from './interfaces';
    export class ${CLASS_NAME} {
        private readonly rpcClient: RpcClient<${INTERFACE_NAME}>;
        constructor(readonly options: RpcClientOptions) {
            this.rpcClient = new RpcClient(options);
        }
        ${methods.join('\n')}
    }
    `;
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

function indexFileTemplate(files: string[]) {
  return `
  /**
   * AUTO-GENERATED FILE.  DO NOT MODIFY.
   *
   * This class was automatically generated.
   * It should not be modified by hand.
   */
  ${files.map(f => `export * from './${f}';`).join('\n')}
  `;
}

function makeReturnType(methodName: string, returnType) {
  if (returnType.toString() === '[object Object]') {
    const interfaceName = toUpperCamalCase(methodName);
    const interfaceType = JsonToTS.default(returnType, { rootName: `I${interfaceName}` });
    fileImports.push(`I${interfaceName}`);
    const interfaceFileName = `${toKebabCase(methodName)}.interface`;
    fileImportsIndex.push(interfaceFileName);
    // export it
    interfaceType[0] = interfaceType[0].replace(/interface/g, 'export interface');
    writeFileSync(
      join(__dirname, `./interfaces/${interfaceFileName}.ts`),
      interfaceType.join('\n'),
      {
        encoding: 'utf8',
      },
    );
    return `I${interfaceName}`;
  } else {
    return returnType;
  }
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

function toUpperCamalCase(word: string) {
  return word
    .slice(0, 1)
    .toUpperCase()
    .concat(word.substring(1));
}

function toKebabCase(word: string) {
  return word.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

// Run The script
main();
