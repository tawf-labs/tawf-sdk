/**
 * CompactCompiler - Compiler interface for Compact contracts
 *
 * @module @tawf/compact-contracts/lib
 */

import { execSync } from 'child_process';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';

export interface CompileOptions {
  /** Input file path */
  input: string;
  /** Output directory */
  output?: string;
  /** Whether to generate verification keys */
  generateKeys?: boolean;
  /** Optimization level (0-3) */
  optimize?: number;
  /** Whether to generate TypeScript bindings */
  generateBindings?: boolean;
}

export interface CompileResult {
  /** Whether compilation succeeded */
  success: boolean;
  /** Compiled circuit path */
  circuitPath?: string;
  /** Verification key path */
  vkPath?: string;
  /** Proving key path */
  pkPath?: string;
  /** Generated TypeScript bindings */
  bindingsPath?: string;
  /** Errors if compilation failed */
  errors?: string[];
}

/**
 * Compile a Compact contract
 */
export async function compileCompact(options: CompileOptions): Promise<CompileResult> {
  const errors: string[] = [];

  try {
    // Ensure output directory exists
    const outputDir = options.output || join(dirname(options.input), 'build');
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    // Build compile command
    const cmd = [
      'compactc',
      options.input,
      '-o', outputDir,
    ];

    if (options.optimize !== undefined) {
      cmd.push('-O', options.optimize.toString());
    }

    if (options.generateKeys) {
      cmd.push('--keys');
    }

    // Execute compiler
    execSync(cmd.join(' '), { stdio: 'inherit' });

    const baseName = join(outputDir, getBaseName(options.input));

    const result: CompileResult = {
      success: true,
      circuitPath: `${baseName}.js`,
    };

    if (options.generateKeys) {
      result.vkPath = `${baseName}.vk`;
      result.pkPath = `${baseName}.pk`;
    }

    if (options.generateBindings) {
      result.bindingsPath = await generateBindings(options.input, outputDir);
    }

    return result;
  } catch (error) {
    errors.push(error instanceof Error ? error.message : String(error));
    return { success: false, errors };
  }
}

/**
 * Generate TypeScript bindings for a Compact contract
 */
async function generateBindings(inputPath: string, outputDir: string): Promise<string> {
  // Placeholder for binding generation
  const bindingsPath = join(outputDir, getBaseName(inputPath) + '.ts');

  // This would parse the Compact file and generate bindings
  // For now, return a placeholder
  writeFileSync(bindingsPath, `// Auto-generated bindings for ${inputPath}`);

  return bindingsPath;
}

/**
 * Get base filename without extension
 */
function getBaseName(filePath: string): string {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  return fileName.replace('.compact', '');
}

/**
 * Compile all contracts in a directory
 */
export async function compileAll(
  _inputDir: string,
  _outputDir: string
): Promise<Map<string, CompileResult>> {
  const results = new Map<string, CompileResult>();

  // This would find all .compact files and compile them
  // For now, return empty map

  return results;
}
