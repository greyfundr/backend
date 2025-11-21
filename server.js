const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

const globalErrorHandler = require("./helpers/globalErrorHandler");

const userRoute = require("./Routes/endpoints/user");
const authRoute = require("./Routes/endpoints/auth");
const adminRoute = require("./Routes/endpoints/admin");
const backerRoute = require("./Routes/endpoints/backer");
const campaignRoute = require("./Routes/endpoints/campaigns");
const championRoute = require("./Routes/endpoints/champion");
const followerRoute = require("./Routes/endpoints/follower");
const walletRoute = require("./Routes/endpoints/wallets");
const splitBillRoute = require("./Routes/endpoints/splitbill");
const notificationRoutes = require("./Routes/endpoints/notifications");
const uploadRoute = require("./Routes/endpoints/upload");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use("/users", userRoute);
app.use("/auth", authRoute);
app.use("/admin", adminRoute);
app.use("/backer", backerRoute);
app.use("/campaign", campaignRoute);
app.use("/champion", championRoute);
app.use("/follower", followerRoute);
app.use("/wallet", walletRoute);
app.use("/split-bill", splitBillRoute);
app.use("/notifications", notificationRoutes);
app.use("/upload", uploadRoute);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "main.html"));
});

app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "register.html"));
});

app.get("/createcampaign", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "campaign.html"));
});

app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "views", "login.html"));
});

app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
