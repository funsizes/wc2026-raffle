import { GetSecretValueCommand, SecretsManagerClient } from '@aws-sdk/client-secrets-manager';

const secretsClient = new SecretsManagerClient({});

let cachedApiKey: string | undefined;

type AppSecrets = {
  footballDataApiKey?: string;
  apiKey?: string;
  FOOTBALL_DATA_API_KEY?: string;
};

function parseFootballApiKey(raw: string): string {
  try {
    const parsed = JSON.parse(raw) as AppSecrets;
    return (
      parsed.footballDataApiKey ??
      parsed.apiKey ??
      parsed.FOOTBALL_DATA_API_KEY ??
      raw
    );
  } catch {
    return raw;
  }
}

/** Local dev / sam local invoke — set FOOTBALL_DATA_API_KEY or DAVE_FOOTBALL_API_KEY. */
function apiKeyFromEnv(): string | undefined {
  const key = process.env.FOOTBALL_DATA_API_KEY ?? process.env.DAVE_FOOTBALL_API_KEY;

  return key && key.length > 0 ? key : undefined;
}

async function apiKeyFromSecretsManager(): Promise<string> {
  const secretId = process.env.APP_SECRETS_ARN ?? process.env.APP_SECRETS_NAME;

  if (!secretId) {
    throw new Error(
      'APP_SECRETS_ARN is not configured and no FOOTBALL_DATA_API_KEY env fallback is set'
    );
  }

  const response = await secretsClient.send(
    new GetSecretValueCommand({ SecretId: secretId })
  );

  if (!response.SecretString) {
    throw new Error(`Secret ${secretId} has no string value`);
  }

  const apiKey = parseFootballApiKey(response.SecretString).trim();

  if (!apiKey || apiKey === 'SET_ME_IN_SECRETS_MANAGER') {
    throw new Error(`Secret ${secretId} is missing a valid footballDataApiKey value`);
  }

  return apiKey;
}

export async function getFootballApiKey(): Promise<string> {
  const fromEnv = apiKeyFromEnv();

  if (fromEnv) return fromEnv;

  if (cachedApiKey) return cachedApiKey;

  cachedApiKey = await apiKeyFromSecretsManager();

  return cachedApiKey;
}
