import * as Joi from 'joi';
import * as dotenv from 'dotenv';

export interface EnvConfig {
  // Server Configuration
  PORT: number;
  PREFIX: string;
  BASE_URL:string;
  ENV: string;
  ELASTIC_SEARCH_URL: string;
  KEY_ENCODER_CRYPTO: string;

  // Database Configuration
  DB_HOST: string;
  DB_PORT: number;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  DB_NAME: string;

  // Authentication Configuration
  AUTH_SECRET_KEY: string;
  AUTH_TIME_REFRESH_TOKEN: string;
  AUTH_TIME_ACCESS_TOKEN: string;
  AUTH_TIME_VERIFY_ACCOUNT: string;
  AUTH_TIME_OTP_VALID: number;
  AUTH_MAX_ATTEMPS_FAILED: number;
  AUTH_TWILIO_ACCOUNT_SID: string;
  AUTH_TWILIO_AUTH_TOKEN: string;

  // Mailer Configuration
  MAILER_HOST: string;
  MAILER_PORT: number;
  MAILER_USER: string;
  MAILER_PASSWORD: string;
}

const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const envSchema = Joi.object<EnvConfig>({
  // Server Configuration Validation
  PORT: Joi.number().port().required(),
  PREFIX: Joi.string().required(),
  BASE_URL:Joi.string().required(),
  ENV: Joi.string().valid('development', 'production', 'test').required(),
  ELASTIC_SEARCH_URL: Joi.string().uri().required(),
  KEY_ENCODER_CRYPTO: Joi.string().base64().required(),

  // Database Configuration Validation
  DB_HOST: Joi.string().hostname().required(),
  DB_PORT: Joi.number().port().required(),
  DB_USERNAME: Joi.string().required(),
  DB_PASSWORD: Joi.string().required(),
  DB_NAME: Joi.string().required(),

  // Authentication Configuration Validation
  AUTH_SECRET_KEY: Joi.string().required(),
  AUTH_TIME_REFRESH_TOKEN: Joi.string().pattern(/^\d+[hdwmy]$/).required(),
  AUTH_TIME_ACCESS_TOKEN: Joi.string().pattern(/^\d+[hdwmy]$/).required(),
  AUTH_TIME_VERIFY_ACCOUNT: Joi.string().pattern(/^\d+[hdwmy]$/).required(),
  AUTH_TIME_OTP_VALID: Joi.number().positive().required(),
  AUTH_MAX_ATTEMPS_FAILED: Joi.number().positive().required(),
  AUTH_TWILIO_ACCOUNT_SID: Joi.string().required(),
  AUTH_TWILIO_AUTH_TOKEN: Joi.string().required(),

  // Mailer Configuration Validation
  MAILER_HOST: Joi.string().hostname().required(),
  MAILER_PORT: Joi.number().port().required(),
  MAILER_USER: Joi.string().email().required(),
  MAILER_PASSWORD: Joi.string().required(),
}).unknown();

const { error, value } = envSchema.validate(process.env, { abortEarly: false });

if (error) {
  console.error(
    'Error en las variables de entorno:',
    error.details.map((x) => x.message).join(', '),
  );
  process.exit(1);
}

export const Envconfig: EnvConfig = value as EnvConfig;