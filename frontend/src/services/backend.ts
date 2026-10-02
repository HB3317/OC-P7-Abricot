export const API_SERVER_URL = (
    process.env.API_SERVER_URL ?? "http://localhost:8000"
).replace(/\/$/, "");
