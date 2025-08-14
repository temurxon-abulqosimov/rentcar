# 🔐 GitHub Setup Guide for CI/CD

This guide explains how to set up GitHub secrets and webhooks for automated deployment.

## 📋 Required GitHub Secrets

### **Repository Secrets (Settings > Secrets and variables > Actions)**

#### **Production Server Secrets**
```
SERVER_HOST          # Your server IP address (e.g., 123.456.789.012)
SERVER_USERNAME      # SSH username (e.g., ubuntu)
SERVER_SSH_KEY      # Private SSH key for server access
SERVER_PORT         # SSH port (usually 22)
```

#### **Staging Server Secrets (Optional)**
```
STAGING_HOST        # Staging server IP
STAGING_USERNAME    # Staging server username
STAGING_SSH_KEY     # Staging server SSH key
STAGING_PORT        # Staging server SSH port
```

#### **Webhook Secret**
```
GITHUB_WEBHOOK_SECRET  # Random string for webhook verification
```

## 🔑 How to Set Up Secrets

### **Step 1: Generate SSH Key Pair**
```bash
# On your local machine
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# This creates:
# ~/.ssh/id_rsa (private key - add to GitHub secrets)
# ~/.ssh/id_rsa.pub (public key - add to server)
```

### **Step 2: Add Public Key to Server**
```bash
# On your server
mkdir -p ~/.ssh
echo "your-public-key-here" >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
chmod 700 ~/.ssh
```

### **Step 3: Add Private Key to GitHub**
1. Go to your repository
2. Click **Settings** > **Secrets and variables** > **Actions**
3. Click **New repository secret**
4. Name: `SERVER_SSH_KEY`
5. Value: Copy the entire private key content from `~/.ssh/id_rsa`

### **Step 4: Add Other Secrets**
```bash
# Server host (IP address)
SERVER_HOST=123.456.789.012

# Username
SERVER_USERNAME=ubuntu

# SSH port
SERVER_PORT=22

# Webhook secret (generate random string)
GITHUB_WEBHOOK_SECRET=your-super-secret-webhook-key-here
```

## 🌐 Setting Up GitHub Webhooks

### **Step 1: Create Webhook**
1. Go to your repository
2. Click **Settings** > **Webhooks**
3. Click **Add webhook**

### **Step 2: Configure Webhook**
```
Payload URL: http://your-server-ip:9000/webhook
Content type: application/json
Secret: [same as GITHUB_WEBHOOK_SECRET]
```

### **Step 3: Select Events**
- ✅ **Just the push event**
- ✅ **Active**

## 🚀 Testing the Setup

### **Test GitHub Actions**
1. Push a change to `main` branch
2. Go to **Actions** tab
3. Watch the workflow run

### **Test Webhook**
1. Push a change to `main` branch
2. Check webhook delivery in GitHub
3. Check server logs for webhook handler

## 📊 Monitoring Deployment

### **GitHub Actions Logs**
- Go to **Actions** tab
- Click on workflow run
- View detailed logs

### **Server Logs**
```bash
# Check webhook handler logs
pm2 logs webhook-handler

# Check application logs
pm2 logs rentcar-api

# Check deployment logs
tail -f ~/deploy.log
```

## 🔧 Troubleshooting

### **Common Issues**

#### **SSH Connection Failed**
```bash
# Test SSH connection
ssh -i ~/.ssh/id_rsa ubuntu@your-server-ip

# Check server SSH configuration
sudo nano /etc/ssh/sshd_config
```

#### **Webhook Not Receiving**
```bash
# Check if webhook handler is running
pm2 status

# Check webhook port
netstat -tlnp | grep :9000

# Test webhook endpoint
curl -X POST http://localhost:9000/webhook
```

#### **Permission Denied**
```bash
# Fix file permissions
chmod +x scripts/auto-deploy.sh
chmod +x scripts/webhook-handler.js

# Fix directory permissions
chmod 755 scripts/
```

## 🛡️ Security Best Practices

1. **Use strong webhook secrets** (32+ characters)
2. **Restrict SSH access** to specific IPs
3. **Use non-root user** for deployment
4. **Regular security updates** on server
5. **Monitor webhook deliveries** for suspicious activity

## 📝 Complete Setup Checklist

- [ ] SSH key pair generated
- [ ] Public key added to server
- [ ] Private key added to GitHub secrets
- [ ] All required secrets configured
- [ ] Webhook created and configured
- [ ] Webhook handler running on server
- [ ] GitHub Actions workflow working
- [ ] Test deployment successful

## 🎯 Next Steps

After setup:
1. **Push to main branch** to trigger first deployment
2. **Monitor logs** for any issues
3. **Test rollback** functionality
4. **Set up monitoring** and alerts
5. **Configure backup** strategies

---

**🎉 Your CI/CD pipeline is now ready for automated deployments!** 