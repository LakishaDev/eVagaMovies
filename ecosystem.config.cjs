module.exports = {
  apps: [
    {
      name: "evagamovies-backend",
      script: "server.js",
      cwd: "/home/lakisha/eVagaMovies/backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      env: {
        NODE_ENV: "production",
        PORT: 3001,
      },
      error_file: "/home/lakisha/eVagaMovies/logs/backend-error.log",
      out_file: "/home/lakisha/eVagaMovies/logs/backend-out.log",
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
