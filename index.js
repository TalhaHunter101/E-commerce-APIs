const express = require("express");
const app = express();
const PORT = 9000;
const mongo = require("./DB/connect");

// rendering routes

// app.use("/user/bankaccount/transaction", require("./Router/transactionRoutes"));
app.use("/user", require("./routers/user_Routers"));
app.use("/admin", require("./routers/admin_routers"));
// Listening on this port

app.listen(PORT, () => {
  console.log(`Server is starting at : ${PORT} `);
});
