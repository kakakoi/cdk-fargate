# cdk-fargate

## env

```bash
$ aws ecr get-login-password --region <region> | docker login --username AWS --password-stdin <accountid>.dkr.ecr.<region>.amazonaws.com
$ export AWS_PROFILE=<profilename>
$ export CONNECTION_ARN=<arn:text>
```

## ECR. push image

```bash
$ aws configure list-profiles
$ cdk deploy EcrStack
```

```bash
$ docker build -t my-repo-name ./app
$ docker tag my-repo-name:latest <accountid>.dkr.ecr.<region>.amazonaws.com/my-repo-name:latest
$ docker push <accountid>.dkr.ecr.<region>.amazonaws.com/my-repo-name:latest
```

## ECS, ALB

```bash
$ cdk deploy VpcStack
$ cdk deploy AlbStack
```