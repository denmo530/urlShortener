const express = require("express");
const config = require("config");
const connectDB = require("./config/db");
const Url = require("./models/Url");
const ShortUniqueId = require("short-unique-id");
var validUrl = require("valid-url");

const app = express();
const PORT = config.get("port");
const uid = new ShortUniqueId({ length: 5 });

app.use(express.json());

// Connect to db
connectDB();

// Routes
// Route to get all saved urls
app.get("/", async (req, res) => {
  try {
    const urls = await Url.find({});
    res.json(urls);
  } catch (error) {
    res.status(500).json("server error");
  }
});

// Route to get long url from slug
app.get("/:slug", async (req, res) => {
  try {
    const url = await Url.findOne({ urlSlug: req.params.slug });

    if (url) {
      res.redirect(url.orgUrl);
    } else {
      return res.status(404).json("No url found");
    }
  } catch (error) {
    res.status(500).json("Server error");
  }
});

// Route to post long url and create short url
app.post("/api/shortenURL", async (req, res) => {
  const { orgUrl } = req.body;
  // Get baseURL from config file
  const baseURL = config.get("baseURL");

  // Validate the baseurl
  if (!validUrl.isUri(baseURL))
    res.status(401).json("Invalid base url: " + baseURL);

  const urlSlug = uid();

  // Validate original url which the user wants to shorten
  if (validUrl.isUri(orgUrl)) {
    try {
      let url = await Url.findOne({ orgUrl });
      if (url) {
        res.json(url);
      } else {
        const shortUrl = baseURL + "/" + urlSlug;
        url = new Url({
          orgUrl,
          shortUrl,
          urlSlug,
          date: new Date(),
        });

        await url.save();
        res.json(url);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json("Server error");
    }
  } else res.status(401).json("Invalid original url");
});

app.listen(PORT, () => {
  console.log("Server running on port: " + PORT);
});
