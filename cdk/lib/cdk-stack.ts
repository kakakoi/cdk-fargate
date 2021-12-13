import { Stack, StackProps, RemovalPolicy } from 'aws-cdk-lib';
import * as ecr from 'aws-cdk-lib/aws-ecr'
import { Construct } from 'constructs';

export class CdkStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new ecr.Repository(this, 'awesomeRepoId', {
      repositoryName: "my-repo-name",
      removalPolicy: RemovalPolicy.DESTROY
    });
  }
}
