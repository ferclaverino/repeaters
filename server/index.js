import express from "express";
import { getAll } from "./repeaters-endpoint.js";

const app = express();
app.use(express.static("dist"));

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Listening on port ${port}`));

app.get("/api/repeaters", getAll);
