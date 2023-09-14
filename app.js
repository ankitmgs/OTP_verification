const express = require("express");
const app = express();
const userRouter = require("./routers/userRouter");

app.use(express.json());

app.use("/user", userRouter);

app.listen(5000, () => {
  console.log(`API is runnning on 5000`);
});
