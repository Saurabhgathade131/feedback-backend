# Deploying Feedback Backend to Vercel

This guide explains how to deploy the `feedback-backend` project to Vercel.

## Prerequisites

1.  A [Vercel](https://vercel.com/) account.
2.  The [Vercel CLI](https://vercel.com/docs/cli) installed (`npm i -g vercel`).
3.  Your MongoDB URI ready.

## Deployment Steps

### 1. Initialize Vercel
Run the following command in the root of the `feedback-backend` directory:
```bash
vercel
```
Follow the prompts to set up the project.

### 2. Configure Environment Variables
You need to add your `.env` variables to Vercel. You can do this in the Vercel Dashboard or via CLI:
```bash
vercel env add MONGODB_URI
```

### 3. Deploy
Once configured, deploy with:
```bash
vercel --prod
```

## Configuration for Vercel

The project is already configured with:
- `vercel.json`: Tells Vercel to use the `@vercel/node` runtime and route all requests to `src/index.ts`.
- `src/index.ts`: Exports the `app` instance, which Vercel requires for Serverless Functions.

## Important Note
Since this is a Serverless deployment, the `app.listen()` call in `src/index.ts` is ignored by Vercel, but remains there for local development. Vercel automatically handles the routing to your Express app.
