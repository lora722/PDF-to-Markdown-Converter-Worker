# PDF to Markdown Converter Worker

This Cloudflare Worker provides a simple web interface for converting PDF files to Markdown format using Cloudflare's AI toMarkdown API.

## Features

- Drag and drop file upload
- Modern, responsive UI
- Direct markdown file download
- Error handling and loading states

## Setup

1. Clone this repository or copy the worker code
2. Install [Wrangler](https://developers.cloudflare.com/workers/wrangler/install-and-update/) if you haven't already
3. Create a new worker project:
   ```bash
   wrangler init pdf-to-markdown
   ```
4. Copy the `worker.js` content into your worker file

## Environment Variables

You need to set up two environment variables:

1. `CF_ACCOUNT_ID`: Your Cloudflare account ID (can be found in the Cloudflare dashboard URL)
2. `CF_API_TOKEN`: An API Token (not API Key) with access to the AI API

### Creating an API Token

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/profile/api-tokens)
2. Click "Create Token"
3. Select "Create Custom Token"
4. Set the following permissions:
   - Account - AI - Edit
   - Account - Account Settings - Read
5. Set appropriate IP address filtering and TTL if desired
6. Create the token and copy it immediately (it won't be shown again)

> **Important**: Use API Tokens instead of API Keys. API Tokens are more secure as they:
> - Have limited, specific permissions
> - Can be revoked individually
> - Can have expiration dates
> - Follow the principle of least privilege

You can set these in your `wrangler.toml`:

```toml
[vars]
CF_ACCOUNT_ID = "your_account_id"
CF_API_TOKEN = "your_api_token"
```

Or using wrangler (recommended for sensitive tokens):

```bash
wrangler secret put CF_ACCOUNT_ID
wrangler secret put CF_API_TOKEN
```

## Deployment

Deploy your worker using:

```bash
wrangler deploy
```

## Usage

1. Visit your worker's URL
2. Drag and drop a PDF file or click to select one
3. Wait for the conversion to complete
4. The markdown file will automatically download

## Limitations

- File size limits apply according to Cloudflare Workers and AI API restrictions
- Only PDF files are supported for conversion 