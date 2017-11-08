import * as _ from 'lodash';
import * as AWS from 'aws-sdk';

import * as config from './config';

export interface Secrets {
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_TOKEN: string;
  REDDIT_USERNAME: string;
  REDDIT_PASSWORD: string;
  STEAM_API_KEY: string;
}

export async function resolve(): Promise<Secrets> {
  if (config.isLocalDev() && !process.env.USE_SECRETS) {
    console.info('Getting secrets from ENV instead of encrypted bundle.');
    return _.pick(process.env, [
      'REDDIT_CLIENT_ID',
      'REDDIT_CLIENT_TOKEN',
      'REDDIT_PASSWORD',
      'STEAM_API_KEY',
    ]) as any;
  }

  const kms = new AWS.KMS({
    region: 'us-west-2',
  });
  console.log('Resolving secrets.');
  const secrets = await kms.decrypt({
    CiphertextBlob: Buffer.from(process.env.SECRETS, 'base64'),
  }).promise();

  return JSON.parse(secrets.Plaintext.toString());
}
