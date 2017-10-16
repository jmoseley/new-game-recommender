# new-game-recommender
Looks at announcements from Steam, and makes Reddit posts about relevant upcoming deals and free weekends.

Designed to be run inside AWS Lambda on a schedule, and generates posts to the specified subreddit based on keyword matches.

## Setup

1. Install `node`
1. Install `npm`
1. Install `yarn`: `npm install -g yarn` 
1. Install deps: `yarn`

## Run

```
STEAM_API_KEY=<api-key>
REDDIT_CLIENT_ID=<app id>
REDDIT_CLIENT_TOKEN=<app secret>
REDDIT_USERNAME=<username>
REDDIT_PASSWORD=<password>
npm start
```

## Tests

```
npm run test
```
