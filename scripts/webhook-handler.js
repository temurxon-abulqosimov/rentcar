#!/usr/bin/env node

/**
 * 🚀 Webhook Handler for Auto-Deployment
 * This script receives GitHub webhooks and triggers deployments
 */

const http = require('http');
const crypto = require('crypto');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const PORT = process.env.WEBHOOK_PORT || 9000;
const SECRET = process.env.GITHUB_WEBHOOK_SECRET || 'your-webhook-secret';
const DEPLOY_SCRIPT = path.join(__dirname, 'auto-deploy.sh');

// Logging
const log = (message) => {
    console.log(`[${new Date().toISOString()}] ${message}`);
};

// Verify GitHub webhook signature
const verifySignature = (payload, signature) => {
    const expectedSignature = `sha256=${crypto
        .createHmac('sha256', SECRET)
        .update(payload)
        .digest('hex')}`;
    
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};

// Execute deployment script
const executeDeploy = (branch, commit) => {
    return new Promise((resolve, reject) => {
        log(`🚀 Triggering deployment for branch: ${branch}, commit: ${commit}`);
        
        exec(`bash ${DEPLOY_SCRIPT} deploy`, (error, stdout, stderr) => {
            if (error) {
                log(`❌ Deployment failed: ${error.message}`);
                reject(error);
                return;
            }
            
            log(`✅ Deployment completed successfully`);
            log(`📋 Output: ${stdout}`);
            
            if (stderr) {
                log(`⚠️  Warnings: ${stderr}`);
            }
            
            resolve(stdout);
        });
    });
};

// Create HTTP server
const server = http.createServer((req, res) => {
    if (req.method !== 'POST') {
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Method not allowed' }));
        return;
    }
    
    if (req.url !== '/webhook') {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
        return;
    }
    
    let body = '';
    
    req.on('data', (chunk) => {
        body += chunk.toString();
    });
    
    req.on('end', async () => {
        try {
            // Verify webhook signature
            const signature = req.headers['x-hub-signature-256'];
            if (!signature || !verifySignature(body, signature)) {
                log('❌ Invalid webhook signature');
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Unauthorized' }));
                return;
            }
            
            // Parse webhook payload
            const payload = JSON.parse(body);
            const event = req.headers['x-github-event'];
            
            log(`📥 Received ${event} webhook from ${payload.repository?.full_name}`);
            
            // Handle push events
            if (event === 'push') {
                const { ref, head_commit } = payload;
                const branch = ref.replace('refs/heads/', '');
                
                // Only deploy from main/master branch
                if (branch === 'main' || branch === 'master') {
                    log(`🚀 Deploying from ${branch} branch`);
                    
                    try {
                        await executeDeploy(branch, head_commit?.id);
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: true,
                            message: 'Deployment triggered successfully',
                            branch,
                            commit: head_commit?.id
                        }));
                    } catch (error) {
                        log(`❌ Deployment execution failed: ${error.message}`);
                        
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            error: 'Deployment failed',
                            message: error.message
                        }));
                    }
                } else {
                    log(`⚠️  Ignoring push to ${branch} branch (not main/master)`);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: true,
                        message: `Ignored push to ${branch} branch`
                    }));
                }
            } else {
                log(`ℹ️  Ignoring ${event} event`);
                
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: `Event ${event} ignored`
                }));
            }
        } catch (error) {
            log(`❌ Error processing webhook: ${error.message}`);
            
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Internal server error',
                message: error.message
            }));
        }
    });
});

// Start server
server.listen(PORT, () => {
    log(`🚀 Webhook handler started on port ${PORT}`);
    log(`📡 Listening for GitHub webhooks at http://localhost:${PORT}/webhook`);
    log(`🔐 Using secret: ${SECRET.substring(0, 8)}...`);
    log(`📜 Deploy script: ${DEPLOY_SCRIPT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    log('🛑 Received SIGTERM, shutting down gracefully');
    server.close(() => {
        log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    log('🛑 Received SIGINT, shutting down gracefully');
    server.close(() => {
        log('✅ Server closed');
        process.exit(0);
    });
}); 