import * as fs from 'fs';
import * as path from 'path';
import config from 'config';

class SetupEnviroments {
  private configFile: any;
  private projectRoots: string[];

  constructor(
    configPath: string = './config/production.json',
    projectRoots: string[] = ['./src/app']
  ) {
    const resolvedConfigPath = path.resolve(configPath);
    try {
      const configContent = fs.readFileSync(resolvedConfigPath, 'utf8');
      this.configFile = JSON.parse(configContent);
    } catch (error) {
      console.error(`Error al leer el archivo de configuración: ${resolvedConfigPath}`);
      console.error(error);
      this.exitProcess(1);
    }
    this.projectRoots = projectRoots.map((root) => path.resolve(root));
  }

  private findConfigGetCalls(dir: string): string[] {
    let results: string[] = [];
    const list = fs.readdirSync(dir);
    for (const file of list) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        results = results.concat(this.findConfigGetCalls(filePath));
      } else if (stat.isFile() && (file.endsWith('.ts') || file.endsWith('.js'))) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8');
          const regex = /config\.get(?:<[^>]*>)?\s*\(\s*['"`]([\w.]+)['"`]\s*\)/g;
          let match;
          while ((match = regex.exec(content)) !== null) {
            results.push(match[1]);
          }
        } catch (error) {}
      }
    }

    return results;
  }

  private exitProcess(code: number): void {
    console.log(`Exiting process with code ${code}`);
    process.exit(code);
  }

  public validate(): void {
    console.log('Validating environment keys...');
    let configKeys: string[] = [];
    for (const root of this.projectRoots) {
      configKeys = configKeys.concat(this.findConfigGetCalls(root));
    }
    const uniqueKeys = [...new Set(configKeys)];

    const missingKeys = uniqueKeys.filter((key) => {
      const parts = key.split('.');
      let obj = this.configFile;
      for (const part of parts) {
        if (obj[part] === undefined) return true;
        obj = obj[part];
      }
      return false;
    });

    if (missingKeys.length > 0) {
      console.error(
        'Error: Las siguientes claves no se encontraron en el archivo de configuración:'
      );
      console.error(missingKeys);
      this.exitProcess(1);
    } else {
      console.log('Environment keys validated successfully.');
    }
  }

  public mapEnviromentsLibs() {
    const envConfig = config.get<Record<string, string>>('ENV');

    if (envConfig) {
      Object.keys(envConfig).forEach((key) => {
        process.env[key] = envConfig[key];
      });
    }
  }
}

const validator = new SetupEnviroments();
validator.validate();
validator.mapEnviromentsLibs();
