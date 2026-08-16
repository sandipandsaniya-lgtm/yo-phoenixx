// Helper to expose the bot instance created by bot.js for tracing
// Uses require.cache to find bot.js and re-export its bot is not possible
// directly; instead the webhook_server attaches via bot.js export below.
