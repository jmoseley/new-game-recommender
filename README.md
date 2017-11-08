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

## Steam Announcements, Running Locally

```
sls dynamodb install
sls dynamodb start
# In another terminal, invoke the function
REDDIT_CLIENT_ID=<value> REDDIT_CLIENT_TOKEN=<value> REDDIT_USERNAME=<value> REDDIT_PASSWORD=<value> STEAM_API_KEY=<value> DEV=1 sls invoke local -f steamAnnouncements
```

## Run Discord Bot Locally

```
STEAM_API_KEY=<value> DEV=1 sls offline
# In another terminal, call the API.
curl -H 'x-api-key: <value from output of "sls offline"' localhost:4000/messages/new?message=hello
```

## Configure secrets

This is required before deployment.

```
serverless encrypt -n SECRETS:REDDIT_CLIENT_ID -v <value> -k <aws KMS key id>
serverless encrypt -n SECRETS:REDDIT_CLIENT_TOKEN -v <value> -k <aws KMS key id>
serverless encrypt -n SECRETS:REDDIT_USERNAME -v <value> -k <aws KMS key id>
serverless encrypt -n SECRETS:REDDIT_PASSWORD -v <value> -k <aws KMS key id>
serverless encrypt -n SECRETS:STEAM_API_KEY -v <value> -k <aws KMS key id>
```

If you want to use these encrypted secrets for local development you can include
`USE_SECRETS=1` as a command line parameter instead of specifying the secrets as
ENV vars.

Example: `DEV=1 USE_SECRETS=1 sls invoke local -f steamAnnouncements`

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

## Appendices

### Getting a Steam API Key

https://steamcommunity.com/dev/apikey

### Reddit Third Party Apps

https://www.reddit.com/prefs/apps
