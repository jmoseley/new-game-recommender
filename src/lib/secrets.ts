import * as _ from 'lodash';
import * as asyncLib from 'async';
import * as AWS from 'aws-sdk';

const kms = new AWS.KMS();

const SECRET_ENVS = _.keyBy([
  'redditClientId',
  'redditClientToken',
  'redditUsername',
  'redditPassword',
  'steamApiKey',
]);

export async function resolve() {
  return await new Promise((resolve, reject) => {
    asyncLib.mapValues(SECRET_ENVS, value => kms.decrypt({
      CiphertextBlob: value,
    }, undefined), (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}
