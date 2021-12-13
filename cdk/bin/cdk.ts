#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { CdkStack } from '../lib/cdk-stack';
import { AlbStack } from '../lib/alb-stack';

const app = new cdk.App();
new CdkStack(app, 'CdkStack');
new AlbStack(app, 'AlbStack');
