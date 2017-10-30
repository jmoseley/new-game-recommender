import * as _ from 'lodash';
import * as asyncLib from 'async';
import * as AWS from 'aws-sdk';

const kms = new AWS.KMS();

export async function resolve() {
  console.log('Resolving secrets.');
  const secrets = await kms.decrypt({
    CiphertextBlob: Buffer.from(process.env.SECRETS, 'base64'),
  }).promise();

  return JSON.parse(secrets.Plaintext.toString());
}
