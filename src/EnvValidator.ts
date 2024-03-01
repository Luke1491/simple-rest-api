export class EnvValidator {
  static validate(): void {
    const requiredEnvVariables = ['DATABASE_URL', 'JWT_SECRET'];

    EnvValidator.checkEnvVariables(requiredEnvVariables);
  }

  static checkEnvVariables = (requiredEnvVariables: string[]): void => {
    for (const variable of requiredEnvVariables) {
      if (!process.env[variable]) {
        console.error(`Missing required environment variable: ${variable}`);
        process.exit(1); // Exit process if any required variables are missing
      }
    }
  };
}
