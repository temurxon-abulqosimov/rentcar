module.exports = {
  apps: [
    {
      name: 'rentcar-api',
      script: 'dist/main.js',
      cwd: '/home/ubuntu/rentcar',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/home/ubuntu/logs/rentcar-api-error.log',
      out_file: '/home/ubuntu/logs/rentcar-api-out.log',
      log_file: '/home/ubuntu/logs/rentcar-api-combined.log',
      time: true
    },
    {
      name: 'webhook-handler',
      script: 'scripts/webhook-handler.js',
      cwd: '/home/ubuntu/rentcar',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '256M',
      env: {
        WEBHOOK_PORT: 9000,
        GITHUB_WEBHOOK_SECRET: 'your-webhook-secret-here'
      },
      error_file: '/home/ubuntu/logs/webhook-error.log',
      out_file: '/home/ubuntu/logs/webhook-out.log',
      log_file: '/home/ubuntu/logs/webhook-combined.log',
      time: true
    }
  ],

  deploy: {
    production: {
      user: 'ubuntu',
      host: 'your-server-ip',
      ref: 'origin/main',
      repo: 'https://github.com/yourusername/your-repo-name.git',
      path: '/home/ubuntu/rentcar',
      'pre-deploy-local': '',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': ''
    }
  }
}; 