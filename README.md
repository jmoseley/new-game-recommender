# new-game-recommender
Looks at announcements from Steam, and makes Reddit posts about relevant upcoming deals and free weekends.

Designed to be run inside AWS Lambda on a schedule, and generates posts to the specified subreddit based on keyword matches.

## Setup

1. Install `node`
1. Install `npm`
1. Install `yarn`: `npm install -g yarn` 
1. Install docker
1. Install AWS SAM: `npm install -g aws-sam-local`
1. Install deps: `yarn`

## Run

This invokes the script using the Lambda SAM CLI tool. This is a local test of
the way the script will be invoked on the lambda platform. This builds the
script using webpack.

```
npm start
```

## Run Script

This invokes the script without using the Lambda runner. This builds the script
using `tsc`.

```
STEAM_API_KEY=<api-key>
REDDIT_CLIENT_ID=<app id>
REDDIT_CLIENT_TOKEN=<app secret>
REDDIT_USERNAME=<username>
REDDIT_PASSWORD=<password>
npm run local
```

## Tests

```
npm run test
```
