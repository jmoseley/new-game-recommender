# new-game-recommender
Looks at announcements from Steam, and makes Reddit posts about relevant upcoming deals and free weekends.
Also handles incoming messages from discord, and responsds.

Designed to be run inside AWS Lambda on a schedule, and generates posts to the specified subreddit based on keyword matches.

## Setup

1. Install `node`
1. Install `npm`
1. Install `yarn`: `npm install -g yarn` 
1. Install serverless: `npm install -g serverless`
1. Install deps: `yarn`
1. Install AWS CLI tools: `pip install aws-cli`
1. Configure AWS credentials: `aws configure`

## Configure secrets

```
serverless encrypt -n SECRETS:REDDIT_CLIENT_ID -v <value> -k <aws KMS key id>
serverless encrypt -n SECRETS:REDDIT_CLIENT_TOKEN -v <value> -k <aws KMS key id>
serverless encrypt -n SECRETS:REDDIT_USERNAME -v <value> -k <aws KMS key id>
serverless encrypt -n SECRETS:REDDIT_PASSWORD -v <value> -k <aws KMS key id>
serverless encrypt -n SECRETS:STEAM_API_KEY -v <value> -k <aws KMS key id>
```

## Run Announcements Posting Locally

First, download and start DynamoDB locally:

http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/DynamoDBLocal.html#DynamoDBLocal.DownloadingAndRunning

Start DynamodDB: `java -Djava.library.path=./dynamodb_local_latest/DynamoDBLocal_lib -jar ./dynamodb_local_latest/DynamoDBLocal.jar -inMemory`

```
sls dynamodb start --migrate
sls invoke local -f steamAnnouncements -s dev
```

## Run Discord Bot Locally

```
sls offline
curl localhost:4000/messages/new?message=hello
```

## Deploy

```
sls deploy
```

## Deploy single function

```
sls deploy function -f <function name>
```

## Tests

```
npm run test
```
