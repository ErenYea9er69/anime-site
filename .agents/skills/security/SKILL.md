---
name: security
description: Web Security Best Practices and Guidelines
---

# Web Security Guidelines

When writing or reviewing code for this project, always enforce the following security practices:

1. **Secrets Management**
   - Never hardcode API keys, passwords, tokens, or sensitive URLs in the source code.
   - Always load sensitive configurations from environment variables (`process.env`).
   - Ensure `.env.local` or `.env` files containing secrets are ignored in `.gitignore`.

2. **Data Validation & Sanitization**
   - Treat all user input as untrusted. Validate parameters, headers, and body payloads at the API level.
   - Use strict type validation (e.g., Zod) for API route inputs.
   - Sanitize data before rendering to prevent Cross-Site Scripting (XSS). Be extremely cautious with React's `dangerouslySetInnerHTML`.

3. **Authentication & Authorization**
   - Ensure all protected API routes explicitly check for valid authentication and proper authorization scopes before processing the request.

4. **Dependencies**
   - Avoid installing unverified or unnecessary npm packages to minimize the attack surface and supply-chain risks.

5. **API Security**
   - Implement rate limiting on sensitive API endpoints (e.g., email forms, login, or public data mutations) to prevent abuse.
