# new-game-recommender
Looks at announcements from Steam, and makes Reddit posts about relevant upcoming deals and free weekends.

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
serverless encrypt -n SECRETS:DISCORD_BOT_TOKEN -v <value> -k <aws KMS key id>
```

## Run Locally

```
sls invoke local -f steamAnnouncements
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
