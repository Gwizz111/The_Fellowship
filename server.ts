import express from "express";
import { randomInt } from "crypto";
import CryptoJS from "crypto-js";
import {MongoClient, ObjectId} from "mongodb"

const dbUri = "mongodb+srv://fellowship:fWsnI39ZT4gLLqWz@cluster0.t5jctlk.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(dbUri);
const main = async() => {
  try {
    await client.connect();
    console.log("Connected to database")
  } catch (error) {
    console.error(error);
  }
}
main();

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
app.use(express.urlencoded({ extended:true}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended:true}));

app.get("/", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/index.ejs");
});

app.get("/login", (req: any, res: any) => {
  let failed: boolean = false;
  if (req.query.failed == "true") {
    failed = true;
  }
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/login.ejs", {
    failed: failed,
  });
});

interface User {
  _id?: ObjectId;
  username: string;
  password: string;
}
let currentUserId:any;

app.post("/login", async (req: any, res: any) => {
  const formUsername = req.body.username;
  const formPassword = req.body.password;
  let encryptedPassword = CryptoJS.SHA256(formPassword).toString(
    CryptoJS.enc.Hex
  );
  let result = await client
    .db("fellowship")
    .collection("users")
    .findOne<User>({ username: formUsername, password: encryptedPassword });
  if (
    result?.password == encryptedPassword &&
    result?.username == formUsername
  ) {
    currentUserId = result._id;
    res.redirect("/homepage");
  } else {
    res.redirect("/login");
  }
});

app.get("/registreer", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/registreer.ejs");
});

app.post("/registreer", async (req: any, res: any) => {
  const formUsername = req.body.username;
  const formPassword1 = req.body.password;
  const formPassword2 = req.body.password2
  let result = await client
    .db("fellowship")
    .collection("users")
    .findOne<User>({ username: formUsername});
  if (
    result?.username == formUsername || formPassword1 != formPassword2
  ) {
    res.redirect("/registreer")
  }
  else{
    let encryptedPassword = CryptoJS.SHA256(formPassword2).toString(
      CryptoJS.enc.Hex
    );
    let newUser:User = {username: formUsername, password: encryptedPassword} 
    client.db("fellowship")
    .collection("users")
    .insertOne(newUser);
    res.redirect("/homepage")
  }
});



app.get("/homepage", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/homepage.ejs");
});

interface Question {
  text: string;
  movie: string[];
  answers: string[];
}

//The One API
let score: number = 0;

let quotesData: any;
let quotePick: number = 0;
let quotesDocs: any;
let quote: string = "";
let quoteid: string = "";


let cMovie: string = "";
let cMovieid: string = "";

let ccharacter: string = "";
let ccharacter2: string = "";
let ccharacterid: string = "";

let MovieData: any;
let MoviePick: number = 0;
let MovieDocs: any;
let Movie: string = "";
let Movie2: string = "";
let Movieid: string = "";



let characterData: any;
let characterPick: number = 0;
let characterDocs: any;
let character: string = "";
let character2: string = "";
let characterid: string = "";
interface Question {
  text: string;
  movie: string[];
  answers: string[];
}
const shuffleArray = (array: string[]): any[] => {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
};
app.get("/rounds",async (req, res) => {
  do{
  try {
    let response = await fetch("https://the-one-api.dev/v2/quote", { headers, });
    let data = await response.json();
    quotesData = data;
  } catch (error) {
    quotesData = require("../The_Fellowship/api/quotes.json");
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
  do{
    MoviePick = Math.floor(Math.random() * MovieDocs.length);
    Movieid = MovieDocs[MoviePick].id;
    Movie = MovieDocs[MoviePick].name;
  } while(Movie=="The Lord of the Rings Series" || Movie=="The Hobbit Series");

  do{
    MoviePick = Math.floor(Math.random() * MovieDocs.length);
    Movieid = MovieDocs[MoviePick].id;
    Movie2 = MovieDocs[MoviePick].name;
  } while(Movie2=="The Lord of the Rings Series" || Movie2=="The Hobbit Series");
  
  cMovieid = quotesDocs[quotePick].movie;
  
  for (let index = 0; index < MovieDocs.length; index++) {
    const element = MovieDocs[index];
    if(element._id == cMovieid){
      cMovie = element.name;
    }
  }

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
  
  characterPick = Math.floor(Math.random() * characterDocs.length);

  characterid = characterDocs[characterPick].id;
  character2 = characterDocs[characterPick].name;

  ccharacterid=quotesDocs[quotePick].character;
  for (let index = 0; index < characterDocs.length; index++) {
    const element = characterDocs[index];
    if(element._id == ccharacterid){
      ccharacter = element.name;
    }
  }
  }while (ccharacter === "" || ccharacter === "MINOR_CHARACTER");
  

  let chosenQuote: Question = {
    text: quote,
    movie: [cMovie],
    answers: [ccharacter],
  };
  chosenQuote.answers.push(character)
  chosenQuote.answers.push(character2)
  chosenQuote.movie.push(Movie)
  chosenQuote.movie.push(Movie2)
  
  chosenQuote.answers=shuffleArray(chosenQuote.answers)
  chosenQuote.movie=shuffleArray(chosenQuote.movie)

  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/rounds.ejs", {quote,Movie,Movie2,character,character2,cMovie,ccharacter,score});
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

app.post("/rounds", (req, res) => {
  const givenCharacter = req.body.selectedCharacter;
  const givenMovie = req.body.selectedMovie;
  const correctCharacter = ccharacter;
  const correctMovie = cMovie;


  if (givenCharacter === correctCharacter && givenMovie === correctMovie) {
    score = score + 1;
  }
  if (
    (givenCharacter === correctCharacter && givenMovie !== correctMovie) ||
    (givenCharacter !== correctCharacter && givenMovie === correctMovie)
  ) {
    score = score + 0.5;
  }

  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/rounds.ejs", {quote,Movie,Movie2,character,character2,cMovie,ccharacter,score});
});

app.listen(app.get("port"), () =>
  console.log("[server] http://localhost:" + app.get("port"))
);

const exit = async () => {
  try {
    await client.close();
    console.log("Disconnected from database");
  } catch (error) {
    console.error(error);
  }
  process.exit(0);
};

process.on("SIGINT", async () => {
  await exit();
  process.exit();
});
