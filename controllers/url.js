const shortid = require("shortid");
const URL = require("../models/url");
const user = require("../models/user");


async function handleGenerateNewShortURL(req, res) {
  const body = req.body;
  //check if user is logged in
  if (!user) return console.log("user not found");
  //check if url is present
  if (!body.url) return res.status(400).json({ error: "url is required" });
  const shortID = shortid();
  //create new url and insert user id
  await URL.create({
    shortId: shortID,
    redirectURL: body.url,
    createdBy:req.user.username,
  });
  return res.redirect("/test");

}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;
  const result = await URL.findOne({ shortId });
  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
};

