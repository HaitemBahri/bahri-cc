# Architecture

## Overview

- **Web** — Astro static site (`apps/web/`), Tailwind CSS v4 and Starwind UI. Served from a private S3 bucket through CloudFront at `bahri.cc`.
- **API** — ASP.NET minimal API on AWS Lambda (`apps/api/`), reached through the same CloudFront distribution at `/api/*`. Sends contact form emails via SES.
- **Infra** — AWS CDK in C# (`infra/`). Region `eu-west-2`; the certificate lives in `us-east-1`.

`apps/api/` and `infra/` are added in later issues.

## Releases

Each app ships on its own tag (`web/vX.Y.Z`, `api/vX.Y.Z`); a pushed tag deploys via GitHub Actions. Manifests stay at `0.0.0`.
