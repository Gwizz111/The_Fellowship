import express from "express";
import { randomInt } from "crypto";
const app = express();

//Bearer token The One Api
const headers = {
  Accept: "application/json",
  Authorization: "Bearer RWp8MgXHV3cbSRQgxAY4",
};

app.set("view engine", "ejs"); // EJS als view engine
app.set("port", 3000);

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/index.ejs");
});

app.get("/homepage", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/homepage.ejs");
});

//The One API
let quotesData: any;
let quotePick: number = 0;
let quotesDocs: any;
let quote: string = "";
let quoteid: string = "";
let MovieData: any;
let MoviePick: number = 0;
let MovieDocs: any;
let Movie: string = "";
let Movieid: string = "";
let characterData: any;
let characterPick: number = 0;
let characterDocs: any;
let character: string = "";
let characterid: string = "";
app.get("/rounds",async (req, res) => {
  try {
    let response = await fetch("https://the-one-api.dev/v2/quote", { headers, });
    let data = await response.json();
    quotesData = data;
  } catch (error) {
    quotesData = require("./api/quotes.json");
  }

  quotesDocs = quotesData.docs;
  quotePick = Math.floor(Math.random() * quotesDocs.length);

  quoteid = quotesDocs[quotePick].id;
  quote = quotesDocs[quotePick].dialog;

  if (!quote.includes('"')) {
    quote = '"' + quote + '"';
  }

  try {
    let response = await fetch("https://the-one-api.dev/v2/Movie", { headers, });
    let data = await response.json();
    MovieData = data;
  } catch (error) {
    MovieData = require("./api/Movie.json");
  }
  MovieDocs = MovieData.docs;
  MoviePick = Math.floor(Math.random() * MovieDocs.length);

  Movieid = MovieDocs[MoviePick].id;
  Movie = MovieDocs[MoviePick].name;
  
  try {
    let response = await fetch("https://the-one-api.dev/v2/character", { headers, });
    let data = await response.json();
    characterData = data;
  } catch (error) {
    characterData = require("./api/character.json");
  }
  characterDocs = characterData.docs;
  characterPick = Math.floor(Math.random() * characterDocs.length);

  characterid = characterDocs[characterPick].id;
  character = characterDocs[characterPick].name;
  
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/rounds.ejs", {quote,Movie,character});
});

app.get("/suddendeath", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/suddendeath.ejs");
});

app.get("/favourites", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/favourites.ejs");
});

app.get("/blacklist", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/blacklist.ejs");
});

app.get("/login", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/login.ejs");
});

app.get("/registreer", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/registreer.ejs");
});

app.listen(app.get("port"), () =>
  console.log("[server] http://localhost:" + app.get("port"))
);
