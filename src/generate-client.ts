import * as glob from 'fast-glob';
import { writeFileSync } from 'fs';
import * as JsonMerger from 'json-merger';
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
interface JSONEntry {
  path: string;
}
const fileImports: Set<string> = new Set();
const fileImportsIndex: Set<string> = new Set();
const jsonFiles = glob
  .sync<JSONEntry>(['*.json'], {
    cwd: join(__dirname, './methods'),
    transform: entry => (typeof entry === 'string' ? { path: entry } : { path: entry.path }),
  })
  .map(e => join(__dirname, `./methods/${e.path}`));

const bitcoinMethods: BitcoinMethods = JsonMerger.mergeFiles(jsonFiles, {
  errorOnFileNotFound: true,
});

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
  console.log('GENERATED OK!');
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
    import { ${[...fileImports.values()].join(', ')} } from './interfaces';
    export class ${CLASS_NAME} {
        private readonly rpcClient: RpcClient<${INTERFACE_NAME}>;
        /**
         * Create a **${CLASS_NAME}**.
         * @param {RpcClientOptions} options - add options to config the underlying RPC Engine.
         */
        constructor(readonly options: RpcClientOptions) {
            this.rpcClient = new RpcClient(options);
        }
        ${methods.join('\n')}
    }
    `;
}

function methodTemplate({ mName, methodParams, rawParams, paramsDocs, returnType, mDescription }) {
  if (returnType === null) {
    // we have not emitting null as a return type, using void is nicer.
    returnType = 'void'.replace(/'/, '');
  }
  return `
  /**
   * ${mDescription}${paramsDocs.length > 0 ? '\n' : ''}${paramsDocs.join('\n')}
   * @async
   * @public
   * @return {${returnType}} the Rpc response as **${returnType}**
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
    const paramType = makeParamType(param, currentParam.type);
    const formated = currentParam.required ? paramType : paramType.toString().concat('?');
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
    const paramType = makeParamType(param, currentParam.type);
    formatedParams.push(`${param}${currentParam.required ? '' : '?'}: ${paramType}`);
    paramsDocs.push(`* @param {${paramType}} ${param} - ${currentParam.description}.`);
  }
  return [formatedParams.join(', '), rawParams, paramsDocs];
}

function makeParamType(paramName: string, paramType: any) {
  // we have a json object, so we need to convert it to interface
  if (paramType && paramType.toString() === '[object Object]') {
    return resolveTypeToInterface(paramName, paramType);
  } else {
    return paramType;
  }
}

function makeReturnType(methodName: string, returnType) {
  // we have a json object, so we need to convert it to interface
  if (returnType && returnType.toString() === '[object Object]') {
    return resolveTypeToInterface(methodName, returnType);
  } else {
    return returnType;
  }
}

function resolveTypeToInterface(cName: string, cType: any) {
  const interfaceName = toUpperCamalCase(cName);
  const interfaceType = JsonToTS.default(cType, { rootName: `I${interfaceName}` });
  fileImports.add(`I${interfaceName}`);
  const interfaceFileName = `${toKebabCase(cName)}.interface`;
  fileImportsIndex.add(interfaceFileName);
  // export it
  interfaceType[0] = interfaceType[0].replace(/interface/g, 'export interface');
  saveFile(`./interfaces/${interfaceFileName}.ts`, interfaceType.join('\n'));
  return `I${interfaceName}`;
}

function indexFileTemplate(files: Set<string>) {
  return `
  /**
   * AUTO-GENERATED FILE. DO NOT MODIFY.
   *
   * This file was automatically generated.
   * It should not be modified by hand.
   */
  ${[...files.values()].map(f => `export * from './${f}';`).join('\n')}
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
