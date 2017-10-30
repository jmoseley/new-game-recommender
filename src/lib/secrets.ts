import * as _ from 'lodash';
import * as AWS from 'aws-sdk';

const kms = new AWS.KMS();

export interface Secrets {
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_TOKEN: string;
  REDDIT_USERNAME: string;
  REDDIT_PASSWORD: string;
  STEAM_API_KEY: string;
}

export async function resolve(): Promise<Secrets> {
  console.log('Resolving secrets.');
  const secrets = await kms.decrypt({
    CiphertextBlob: Buffer.from(process.env.SECRETS, 'base64'),
  }).promise();

  return JSON.parse(secrets.Plaintext.toString());
}
