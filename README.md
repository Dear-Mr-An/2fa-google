# 2FA Authenticator

A simple TOTP two-factor authentication code generator that can be deployed to Cloudflare Pages.

## Deploy to Cloudflare Pages

1. Push code to GitHub repository
2. Login to [Cloudflare Dashboard](https://dash.cloudflare.com/)
3. Go to Pages → Create a project
4. Connect your GitHub repository
5. Build settings:
   - Build command: (leave empty)
   - Build output directory: /
6. Click Deploy

## Local Testing

Open `index.html` directly in your browser.

## Usage

1. Enter your 2FA secret key
2. Click "Add" button
3. Code refreshes automatically every 30 seconds
4. Data is saved in browser local storage
