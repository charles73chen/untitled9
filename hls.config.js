module.exports = {
  apps: [
    {
      name: 'hls',
      watch: true,
      script: './hls.js',
      log_date_format: 'YYYY-MM-DD HH:mm:SS',
      ignore_watch: ['node_modules', '.git', '*.log', '*.html', '.idea', 'source-m3u8', 'log', '.idea', '.txt', '.bak'],
    },
  ],
};
