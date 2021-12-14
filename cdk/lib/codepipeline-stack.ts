import { Stack, StackProps, pipelines } from "aws-cdk-lib";
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
    const repository = ecr.Repository.fromRepositoryName(
      this,
      "repo",
      "my-repo-name"
    );

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
          "npx cdk synth",
          "cd ../",
        ],
        primaryOutputDirectory: 'cdk/cdk.out',
      }),
      dockerEnabledForSelfMutation: true,
    });

    pipeline.addWave("MyWave", {
      post: [
        new pipelines.CodeBuildStep("RunApproval", {
          commands: ["command-from-image"],
          buildEnvironment: {
            // The user of a Docker image asset in the pipeline requires turning on
            // 'dockerEnabledForSelfMutation'.
            // buildImage: codebuild.LinuxBuildImage.fromAsset(this, 'Image', {
            //   directory: '../app',
            // }),
            buildImage: codebuild.LinuxBuildImage.fromEcrRepository(repository),
          },
        }),
      ],
    });
  }
}
