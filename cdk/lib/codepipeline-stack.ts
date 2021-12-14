import { Stack, StackProps, pipelines, Stage } from "aws-cdk-lib";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as ecr from "aws-cdk-lib/aws-ecr";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";

export class CodePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const buildRole = new iam.Role(this, "CodeBuildRole", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      managedPolicies: [
        {
          managedPolicyArn: "arn:aws:iam::aws:policy/AdministratorAccess",
        },
      ],
    });

    const conArn = ssm.StringParameter.valueFromLookup(
      this,
      "/pipeline/con/github/CdkFargate"
    );

    const ecrName = 'my-repo-name'
    const account = process.env.CDK_DEFAULT_ACCOUNT
    const region = process.env.CDK_DEFAULT_REGION

    const repository = ecr.Repository.fromRepositoryName(this, 'repo', ecrName)

    const pipeline = new pipelines.CodePipeline(this, "Pipeline", {
      synth: new pipelines.CodeBuildStep("build", {
        role: buildRole,
        input: pipelines.CodePipelineSource.connection(
          "kakakoi/cdk-fargate",
          "main",
          {
            connectionArn: conArn,
          }
        ),
        commands: [
          "cd cdk",
          "npm ci",
          "npm run build",
          "npx cdk synth --all",
        ],
        primaryOutputDirectory: "cdk/cdk.out",
      }),
      dockerEnabledForSelfMutation: true,
    });

    pipeline.addWave('MyWave', {
      post: [
        new pipelines.CodeBuildStep('RunApproval', {
          commands: [
            `aws ecr get-login-password --region ${region} | docker login --username AWS --password-stdin ${account}.dkr.ecr.${region}.amazonaws.com`,
            `docker build -t ${ecrName} ./app`,
            `docker tag ${ecrName}:latest ${account}.dkr.ecr.${region}.amazonaws.com/${ecrName}:latest`,
            `docker push ${account}.dkr.ecr.${region}.amazonaws.com/${ecrName}:latest`,
          ],
          buildEnvironment: {
            privileged: true,
            buildImage: codebuild.LinuxBuildImage.fromEcrRepository(repository)
          },
        }),
      ],
    });
  }
}