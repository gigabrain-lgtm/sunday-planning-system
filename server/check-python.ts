/**
 * Diagnostic endpoint to check if Python is available
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function checkPythonAvailability() {
  const results: any = {
    pythonAvailable: false,
    pythonVersion: null,
    pipAvailable: false,
    pipVersion: null,
    pyeightInstalled: false,
    psycopg2Installed: false,
    errors: [],
  };

  try {
    // Check Python
    const { stdout: pythonVersion } = await execAsync('python3 --version');
    results.pythonAvailable = true;
    results.pythonVersion = pythonVersion.trim();
  } catch (error: any) {
    results.errors.push(`Python check failed: ${error.message}`);
  }

  try {
    // Check pip
    const { stdout: pipVersion } = await execAsync('pip3 --version');
    results.pipAvailable = true;
    results.pipVersion = pipVersion.trim();
  } catch (error: any) {
    results.errors.push(`Pip check failed: ${error.message}`);
  }

  try {
    // Check pyeight
    const { stdout } = await execAsync('pip3 show pyeight');
    results.pyeightInstalled = stdout.includes('Name: pyeight');
  } catch (error: any) {
    results.errors.push(`pyeight check failed: ${error.message}`);
  }

  try {
    // Check psycopg2
    const { stdout } = await execAsync('pip3 show psycopg2-binary');
    results.psycopg2Installed = stdout.includes('Name: psycopg2-binary');
  } catch (error: any) {
    results.errors.push(`psycopg2 check failed: ${error.message}`);
  }

  return results;
}
