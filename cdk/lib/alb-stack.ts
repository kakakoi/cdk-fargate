import { Stack, StackProps } from 'aws-cdk-lib';
import * as ecsPatterns from 'aws-cdk-lib/aws-ecs-patterns'
import * as ecs from 'aws-cdk-lib/aws-ecs'
import * as ecr from 'aws-cdk-lib/aws-ecr'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Construct } from 'constructs';

export class AlbStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromLookup(this, 'vpc', {
      vpcName: 'VpcStack/my-vpc-name',

    })

    const cluster = new ecs.Cluster(this, 'Cluster', {
      vpc,
    })

    const repository = ecr.Repository.fromRepositoryName(this, 'repo', 'my-repo-name')
    const loadBalancedFargateService = new ecsPatterns.ApplicationLoadBalancedFargateService(this, 'Service', {
      cluster,
      memoryLimitMiB: 1024,
      cpu: 512,
      taskImageOptions: {
        image: ecs.ContainerImage.fromEcrRepository(repository)
      },
    });

    loadBalancedFargateService.targetGroup.configureHealthCheck({
      path: "/custom-health-path",
    });
  }
}
