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
    const [methodParams, rawParams, paramsDocs] = makeMethodParams(params);
    methods.push(
      methodTemplate({
        mName: methodName,
        methodParams,
        rawParams,
        paramsDocs,
        returnType: makeReturnType(methodName, result.type),
        mDescription: description,
      }),
    );
    records.push(interfaceRecordTemplate(methodName, params));
  }
  // Save the generated files
  saveFile('./bitcoin-client.ts', classTemplate(methods));
  saveFile('./bitcoin-rpc-service.interface.ts', interfaceTemplate(records));
  saveFile('./interfaces/index.ts', indexFileTemplate(fileImportsIndex));
}

function classTemplate(methods: string[]) {
  return `
  /**
   * AUTO-GENERATED FILE. DO NOT MODIFY.
   *
   * This class was automatically generated.
   * It should not be modified by hand.
   */
    /* tslint:disable */
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

function methodTemplate({ mName, methodParams, rawParams, paramsDocs, returnType, mDescription }) {
  return `
  /**
   * ${mDescription}${paramsDocs.length > 0 ? '\n' : ''}${paramsDocs.join('\n')}
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
   * AUTO-GENERATED FILE. DO NOT MODIFY.
   *
   * This file was automatically generated.
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
  const paramsDocs: string[] = [];
  // tslint:disable-next-line:forin
  for (const param in params) {
    const currentParam = params[param];
    rawParams.push(param);
    formatedParams.push(`${param}${currentParam.required ? '' : '?'}: ${currentParam.type}`);
    paramsDocs.push(`* @param {${currentParam.type}} ${param} - ${currentParam.description}.`);
  }
  return [formatedParams.join(', '), rawParams, paramsDocs];
}

function makeReturnType(methodName: string, returnType) {
  // we have a json object, so we need to convert it to interface
  if (returnType.toString() === '[object Object]') {
    const interfaceName = toUpperCamalCase(methodName);
    const interfaceType = JsonToTS.default(returnType, { rootName: `I${interfaceName}` });
    fileImports.push(`I${interfaceName}`);
    const interfaceFileName = `${toKebabCase(methodName)}.interface`;
    fileImportsIndex.push(interfaceFileName);
    // export it
    interfaceType[0] = interfaceType[0].replace(/interface/g, 'export interface');
    saveFile(`./interfaces/${interfaceFileName}.ts`, interfaceType.join('\n'));
    return `I${interfaceName}`;
  } else {
    return returnType;
  }
}

function indexFileTemplate(files: string[]) {
  return `
  /**
   * AUTO-GENERATED FILE. DO NOT MODIFY.
   *
   * This file was automatically generated.
   * It should not be modified by hand.
   */
  ${files.map(f => `export * from './${f}';`).join('\n')}
  `;
}

function toUpperCamalCase(word: string) {
  return word
    .slice(0, 1) // get 1st char
    .toUpperCase() // make it upper case
    .concat(word.substring(1)); // then append the rest of the string
}

function toKebabCase(word: string) {
  return word.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function saveFile(relativePath: string, data: any) {
  writeFileSync(join(__dirname, relativePath), data, { encoding: 'utf8' });
}

// Run The script
main();
