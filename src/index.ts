import express from "express";
import identifyRoute from "./routes/identify";

const app = express();
app.use(express.json());

app.use(express.json());
app.use("/", identifyRoute);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});