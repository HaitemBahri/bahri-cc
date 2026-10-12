# AWS Setup (One-Off)

Run once from a laptop with AWS admin credentials (kept in 1Password) and the 1Password CLI (`op`) signed in. After this, releases deploy from tags without manual AWS steps.

CDK CLI: `npx -y aws-cdk@2.1144.0` (shortened to `cdk` below). Run from `infra/`.

## 1. 1Password

1. Create the vault `bahri-cc`.
2. Add items:
   - `aws` with fields `account-id`, `hosted-zone-id` (the existing `bahri.cc` zone), `alert-email` (where budget and alarm emails go), `certificate-arn` (placeholder until step 3), `deploy-role-arn` (placeholder until step 3)
   - `preview-token` with field `credential` (a long random string)
   - `linear` with field `release-access-key` (access key of the Linear pipeline `bahri-cc web`, from its settings page)
3. Create service account `bahri-cc-ci` with **read-only** access to `bahri-cc` only. Save its token in the vault, then:

   ```sh
   gh secret set OP_SERVICE_ACCOUNT_TOKEN --repo HaitemBahri/bahri-cc
   ```

## 2. Bootstrap CDK

```sh
op run --env-file=.env.example -- sh -c 'cdk bootstrap aws://$AWS_ACCOUNT_ID/eu-west-2 aws://$AWS_ACCOUNT_ID/us-east-1'
```

## 3. Deploy the one-off stacks

The GitHub OIDC provider already exists in the account; `BootstrapStack` imports it.

```sh
op run --env-file=.env.example -- cdk deploy BootstrapStack CertStack
```

Copy the outputs into 1Password: `CertStack.CertificateArn` → `aws/certificate-arn`, `BootstrapStack.DeployRoleArn` → `aws/deploy-role-arn`.

## 4. Check

- Budget `bahri-cc-monthly` exists with two email notifications to the `aws/alert-email` address.
- `gh secret list --repo HaitemBahri/bahri-cc` shows only `OP_SERVICE_ACCOUNT_TOKEN`.
