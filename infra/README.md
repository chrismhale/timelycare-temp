# ProperView Infra

This project uses [SST v3](https://docs.sst.dev/) to define and deploy infrastructure for the ProperView application.

## Usage

- `npm run build` — Build the infrastructure
- `npm run deploy` — Deploy to AWS
- `npm run remove` — Remove the stack from AWS

## Configuration

Infrastructure is defined in `sst.config.ts` (not CDK or CloudFormation).

## Notes
- Do **not** use `cdk.json` or CDK stack files. All infra is managed by SST.
- See the [SST docs](https://docs.sst.dev/) for more info.
