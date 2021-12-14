import { Stack, StackProps } from "aws-cdk-lib";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class SsmStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const conArnStr = process.env.CONNECTION_ARN
    if(conArnStr != undefined) {
      const conArn = new ssm.StringParameter(this, 'conArn', {
        stringValue: conArnStr,
        parameterName: '/pipeline/con/github/CdkFargate'
      })  
    }
  }
}
