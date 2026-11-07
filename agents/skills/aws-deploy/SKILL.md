---
name: aws-deploy
description: Deploy and operate apps on AWS safely (IAM, serverless, containers, CDK, cost, security). Use for any AWS infrastructure, deploy, IAM policy, or cloud cost task.
---

# AWS deploy

## Before you change anything
- Confirm the account, region and profile: `aws sts get-caller-identity` and `aws configure list`. Never assume production.
- Prefer infrastructure as code (CDK or CloudFormation) over console or CLI edits. Run `cdk diff` or a change set and read it before applying.
- Never put keys in code or `.env.example`. Use roles, SSO or Secrets Manager (see `env-and-secrets`).

## IAM
- Least privilege: scope actions and resources, add conditions. Avoid `*` on both.
- An explicit deny wins; a missing allow is a deny. Check permission boundaries, SCPs and session policies when an allowed action still fails.
- Trust policy (who can assume) and permissions policy (what the role can do) are separate. Role chaining caps sessions at one hour.
- Validate with `aws iam simulate-principal-policy` or Access Analyzer before shipping.

## Choosing compute
- Spiky or small APIs: Lambda + API Gateway or Function URLs.
- Long-running or containerised: ECS Fargate (App Runner for the simplest case).
- Static sites: S3 + CloudFront. Databases: RDS/Aurora for relational, DynamoDB for key-value; never public.

## Safety and cost
- Tag every resource. Set a budget alarm. Delete what you create for experiments.
- Enable CloudTrail, encrypt at rest, block public S3 access, restrict security groups.
- Pass destructive or irreversible steps (delete stack, drop data) to the user for approval.
- Check pricing for NAT gateways, data transfer and idle load balancers first; they cause most surprise bills.

Related: `env-and-secrets`, `security-review`, `senior-backend-engineer`.
