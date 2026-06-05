module.exports = {
  apps: [
    {
      name: "gastos-app",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3006
      }
    }
  ]
};
