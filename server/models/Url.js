const mongoose = require("mongoose");

const urlSchema = new mongoose.Schema({
  orgUrl: String,
  shortUrl: String,
  urlSlug: String,
  date: { type: String, default: Date.now() },
});

const Url = new mongoose.model("Url", urlSchema);

module.exports = Url;
