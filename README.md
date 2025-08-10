# #ThreeTierApp_Deployment

## Overview

The challenge involves deploying a Three-Tier Web Application using ReactJS, NodeJS, and MongoDB, with deployment on AWS EKS. Participants are encouraged to deploy the application, add creative enhancements, and submit a Pull Request (PR). Merged PRs will earn exciting prizes!

🎯 **Challenge Difficulty**: Intermediate to Advanced  
⏱️ **Estimated Time**: 4-6 hours  
💰 **AWS Cost**: ~$10 for complete setup

<img width="1892" height="884" alt="Image" src="https://github.com/user-attachments/assets/33f8a0e3-e2bc-433c-8cae-406162c35b66" />

## Prerequisites

- Basic knowledge of Docker, Kubernetes, and AWS services
- An AWS account with necessary permissions
- Terminal/Command line experience
- Understanding of YAML and basic networking concepts

## 🚀 Quick Start Guide
## Challenge Steps

- [Application Code](#application-code)
- [Jenkins Pipeline Code](#jenkins-pipeline-code)
- [Jenkins Server Terraform](#jenkins-server-terraform)
- [Kubernetes Manifests Files](#kubernetes-manifests-files)
- [Project Details](#project-details)
- [Challenge Levels](#-challenge-levels)

<img width="1907" height="893" alt="Image" src="https://github.com/user-attachments/assets/a8af39a2-9bae-413d-ac68-50e9a205022d" />

## Application Code

The `Application-Code` directory contains the source code for the Three-Tier Web Application. Dive into this directory to explore the frontend and backend implementations.

## Jenkins Pipeline Code

In the `Jenkins-Pipeline-Code` directory, you'll find Jenkins pipeline scripts. These scripts automate the CI/CD process, ensuring smooth integration and deployment of your application.

## Jenkins Server Terraform

Explore the `Jenkins-Server-TF` directory to find Terraform scripts for setting up the Jenkins Server on AWS. These scripts simplify the infrastructure provisioning process.

## Kubernetes Manifests Files

The `Kubernetes-Manifests-Files` directory holds Kubernetes manifests for deploying your application on AWS EKS. Understand and customize these files to suit your project needs.

## Project Details

🛠️ **Tools Explored:**

- Terraform & AWS CLI for AWS infrastructure
- Jenkins, Sonarqube, Terraform, Kubectl, and more for CI/CD setup
- Helm, Prometheus, and Grafana for Monitoring
- ArgoCD for GitOps practices

🚢 **High-Level Overview:**

- IAM User setup & Terraform magic on AWS
- Jenkins deployment with AWS integration
- EKS Cluster creation & Load Balancer configuration
- Private ECR repositories for secure image management
- Helm charts for efficient monitoring setup
- GitOps with ArgoCD - the cherry on top!

<img width="1916" height="472" alt="Image" src="https://github.com/user-attachments/assets/b577c529-3f51-4606-abef-ce116c20b7b6" />

📈 **The journey covered everything from setting up tools to deploying a Three-Tier app, ensuring data persistence, and implementing CI/CD pipelines.**

## Getting Started

To get started with this project, refer to our [comprehensive guide](https://amanpathakdevops.medium.com/advanced-end-to-end-devsecops-kubernetes-three-tier-project-using-aws-eks-argocd-prometheus-fbbfdb956d1a) that walks you through IAM user setup, infrastructure provisioning, CI/CD pipeline configuration, EKS cluster creation, and more.

### Step 1: IAM Configuration

- Create a user `eks-admin` with `AdministratorAccess`.
- Generate Security Credentials: Access Key and Secret Access Key.

### Step 2: EC2 Setup

- Launch an Ubuntu instance in your favourite region (eg. region `us-west-2`).
- SSH into the instance from your local machine.

### Step 3: Install AWS CLI v2

```shell
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
sudo apt install unzip
unzip awscliv2.zip
sudo ./aws/install -i /usr/local/aws-cli -b /usr/local/bin --update
aws configure
```

### Step 4: Install Docker

```shell
sudo apt-get update
sudo apt install docker.io
docker ps
sudo chown $USER /var/run/docker.sock
```

### Step 5: Install kubectl

```shell
curl -o kubectl https://amazon-eks.s3.us-west-2.amazonaws.com/1.19.6/2021-01-05/bin/linux/amd64/kubectl
chmod +x ./kubectl
sudo mv ./kubectl /usr/local/bin
kubectl version --short --client
```

### Step 6: Install eksctl

```shell
curl --silent --location "https://github.com/weaveworks/eksctl/releases/latest/download/eksctl_$(uname -s)_amd64.tar.gz" | tar xz -C /tmp
sudo mv /tmp/eksctl /usr/local/bin
eksctl version
```

### Step 7: Setup EKS Cluster

```shell
eksctl create cluster --name three-tier-cluster --region us-west-2 --node-type t2.medium --nodes-min 2 --nodes-max 2
aws eks update-kubeconfig --region us-west-2 --name three-tier-cluster
kubectl get nodes
```

### Step 8: Deploy Application

```shell
# Create namespace
kubectl create namespace three-tier

# Navigate to manifests directory
cd Kubernetes-Manifests-file

# Deploy MongoDB
kubectl apply -f Database/

# Create MongoDB secret
kubectl create secret generic mongo-sec \
  --from-literal=username=admin \
  --from-literal=password=password123 \
  -n three-tier

# Deploy Backend API
kubectl apply -f Backend/

# Deploy Frontend
kubectl apply -f Frontend/

# Verify deployments
kubectl get all -n three-tier
```

### Step 9: Install AWS Load Balancer

```shell
curl -O https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.5.4/docs/install/iam_policy.json
aws iam create-policy --policy-name AWSLoadBalancerControllerIAMPolicy --policy-document file://iam_policy.json
eksctl utils associate-iam-oidc-provider --region=us-west-2 --cluster=three-tier-cluster --approve
eksctl create iamserviceaccount --cluster=three-tier-cluster --namespace=kube-system --name=aws-load-balancer-controller --role-name AmazonEKSLoadBalancerControllerRole --attach-policy-arn=arn:aws:iam::626072240565:policy/AWSLoadBalancerControllerIAMPolicy --approve --region=us-west-2
```

### Step 10: Deploy AWS Load Balancer Controller

```shell
# Install Helm
sudo snap install helm --classic

# Add EKS Helm repository
helm repo add eks https://aws.github.io/eks-charts
helm repo update eks

# Install AWS Load Balancer Controller
helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
  -n kube-system \
  --set clusterName=three-tier-cluster \
  --set serviceAccount.create=false \
  --set serviceAccount.name=aws-load-balancer-controller

# Verify controller deployment
kubectl get deployment -n kube-system aws-load-balancer-controller

# Deploy Ingress
kubectl apply -f ingress.yaml

# Check ingress status
kubectl get ingress -n three-tier
```

### Step 11: Configure Domain (Optional)

```shell
# Get ALB DNS name
kubectl get ingress mainlb -n three-tier

# Add CNAME record in your DNS:
# Name: todochallenge
# Type: CNAME
# Value: k8s-threetie-mainlb-xxxxx.us-west-2.elb.amazonaws.com
```

## DevOps Troubleshooting Guide

### Common Issues & Solutions

#### 1. ALB Not Getting Address
```shell
# Check controller logs
kubectl logs -n kube-system deployment/aws-load-balancer-controller

# Verify IAM permissions
aws iam get-policy-version --policy-arn arn:aws:iam::ACCOUNT:policy/AWSLoadBalancerControllerIAMPolicy --version-id v1

# Recreate service account if needed
eksctl delete iamserviceaccount --cluster=three-tier-cluster --name=aws-load-balancer-controller --namespace=kube-system
eksctl create iamserviceaccount --cluster=three-tier-cluster --namespace=kube-system --name=aws-load-balancer-controller --attach-policy-arn=arn:aws:iam::ACCOUNT:policy/AWSLoadBalancerControllerIAMPolicy --approve
```

#### 2. Backend Using File Storage Instead of MongoDB
```shell
# Check backend logs
kubectl logs deployment/api -n three-tier

# Verify MongoDB secret
kubectl get secret mongo-sec -n three-tier

# Test MongoDB connection
kubectl exec -it deployment/api -n three-tier -- nslookup mongodb-svc

# Restart backend
kubectl rollout restart deployment/api -n three-tier
```

#### 3. MongoDB Database Access
```shell
# Connect to MongoDB
kubectl exec -it deployment/mongodb -n three-tier -- mongo

# Inside MongoDB shell:
show dbs
use todo
show collections
db.tasks.find().pretty()
```

### Monitoring & Debugging Commands

```shell
# Check all resources
kubectl get all -n three-tier

# Describe problematic pods
kubectl describe pod <POD_NAME> -n three-tier

# Check events
kubectl get events -n three-tier --sort-by='.lastTimestamp'

# Port forward for local testing
kubectl port-forward svc/frontend 3000:3000 -n three-tier
kubectl port-forward svc/api 3500:3500 -n three-tier

# Check ingress details
kubectl describe ingress mainlb -n three-tier

# View logs in real-time
kubectl logs -f deployment/api -n three-tier
kubectl logs -f deployment/frontend -n three-tier
```

### Performance & Scaling

```shell
# Scale deployments
kubectl scale deployment api --replicas=3 -n three-tier
kubectl scale deployment frontend --replicas=2 -n three-tier

# Check resource usage
kubectl top pods -n three-tier
kubectl top nodes

# Set resource limits (add to deployment manifests)
resources:
  requests:
    memory: "128Mi"
    cpu: "100m"
  limits:
    memory: "512Mi"
    cpu: "500m"
```

### Security Best Practices

```shell
# Use secrets for sensitive data
kubectl create secret generic app-secrets \
  --from-literal=jwt-secret=your-jwt-secret \
  --from-literal=api-key=your-api-key \
  -n three-tier

# Enable network policies
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: deny-all
  namespace: three-tier
spec:
  podSelector: {}
  policyTypes:
  - Ingress
  - Egress

# Scan images for vulnerabilities
docker scan your-image:tag
```

### Cleanup

- To delete the EKS cluster:

```shell
eksctl delete cluster --name three-tier-cluster --region us-west-2
```

- To clean up rest of the stuff and not incure any cost

```
Stop or Terminate the EC2 instance created in step 2.
Delete the Load Balancer created in step 9 and 10.
Go to EC2 console, access security group section and delete security groups created in previous steps
```

## Contribution Guidelines

- Fork the repository and create your feature branch.
- Deploy the application, adding your creative enhancements.
- Ensure your code adheres to the project's style and contribution guidelines.
- Submit a Pull Request with a detailed description of your changes.

## Rewards

- Successful PR merges will be eligible for exciting prizes!

## Support

For any queries or issues, please open an issue in the repository.

---

Happy Learning! 🚀👨‍💻👩‍💻
