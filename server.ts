import express from "express";
import { randomInt } from "crypto";
import CryptoJS from "crypto-js";
import {MongoClient, ObjectId, Document, PushOperator, PullOperator} from "mongodb";
import session from "express-session";

declare module 'express-session' {
  interface SessionData {
      userId?: ObjectId;
  }
}

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

app.use(session({
  secret: process.env.SESSION_SECRET ?? "secret-code",
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1800000 }, // 30 minutes
}))

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended:true}))

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
    req.session.userId = result._id;
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
    req.session.userId = newUser._id
    res.redirect("/homepage")
  }
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


let cMovie: string = "";
let cMovieid: string = "";

let ccharacter: string = "";
let ccharacterid: string = "";

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

const favorite = async (userId: ObjectId, quoteId: string, remove: boolean) => {
  let user:any = await client
  .db("fellowship")
  .collection("favorites")
  .findOne({userId: userId});

  if (user == null) {
    let newUser = await client
    .db("fellowship")
    .collection("favorites")
    .insertOne({userId: userId, quoteId: []}) 
  }

  if (remove == false) {
    let addQuote = await client
    .db("fellowship")
    .collection("favorites")
    .updateOne(
      { userId: new ObjectId(userId) },
      { $push: { quoteId: quoteId } as unknown as PushOperator<Document>}
    );
    console.log("added")
  }
  else if (remove == true) {
    let deleteQuote = await client
    .db("fellowship")
    .collection("favorites")
    .updateOne(
      { userId: new ObjectId(userId) },
      { $pull: { quoteId: quoteId } as unknown as PullOperator<Document> }
    )
  }
};

const blacklist = async (userId: ObjectId, quoteId: string, remove: boolean) => {
  let user:any = await client
  .db("fellowship")
  .collection("blacklists")
  .findOne({userId: userId});

  if (user == null) {
    let newUser = await client
    .db("fellowship")
    .collection("blacklists")
    .insertOne({userId: userId, quoteId: []}) 
  }

  let hasFavorite: any = await client
    .db("undefined")
    .collection("favorites")
    .findOne({ userId: new ObjectId(userId), quoteId: quoteId });

  if (hasFavorite != null || (hasFavorite != undefined && remove == false)) {
    let deleteQuote = await client
      .db("undefined")
      .collection("favorites")
      .updateOne(
        { userId: new ObjectId(userId) },
        { $pull: { quoteId: quoteId } as unknown as PullOperator<Document> }
      );
  }
}

interface Quote {
  _id: string,
  dialog: string,
  movie: string,
  character: string,
  id: string
}

interface Movie {
  _id: string,
  name: string,
  runtimeInMinutes: number,
  budgetInMillions: number,
  boxOfficeRevenueInMillions: number,
  academyAwardNominations: number,
  academyAwardWins: number,
  rottenTomatoesScore: number
}

interface Character {
  _id: string
  birth: string
  death: string
  hair: string
  gender: string
  height: string
  realm: string
  spouse: string
  name: string
  race: string
  wikiUrl: string
}

app.get("/rounds",async (req, res) => {
  console.log(req.session.userId)
  let quotes = await client
    .db("fellowship")
    .collection("quotes")
    .find<Quote>({})
  let quotesResult = await quotes.toArray();

  quotesDocs = quotesResult;
  quotePick = Math.floor(Math.random() * quotesDocs.length);

  quoteid = quotesDocs[quotePick].id;
  quote = quotesDocs[quotePick].dialog;
  favorite(currentUserId,"5cd96e05de30eff6ebcceae1",true)
  if (!quote.includes('"')) {
    quote = '"' + quote + '"';
  }

  
 
  let movies = await client
    .db("fellowship")
    .collection("movies")
    .find<Movie>({})
  let movieResult = await movies.toArray();

  MovieDocs = movieResult;

  do{
    MoviePick = Math.floor(Math.random() * MovieDocs.length);
    Movieid = MovieDocs[MoviePick].id;
    Movie = MovieDocs[MoviePick].name;
  } while(Movie=="The Lord of the Rings Series" || Movie=="The Hobbit Series");
  
  cMovieid = quotesDocs[quotePick].movie;
  
  for (let index = 0; index < MovieDocs.length; index++) {
    const element = MovieDocs[index];
    if(element._id == cMovieid){
      cMovie = element.name;
    }
  }

  let characters = await client
    .db("fellowship")
    .collection("characters")
    .find<Character>({})
  let characterResult = await characters.toArray();

  
  characterDocs = characterResult;
  characterPick = Math.floor(Math.random() * characterDocs.length);

  characterid = characterDocs[characterPick].id;
  character = characterDocs[characterPick].name;
  
  ccharacterid=quotesDocs[quotePick].character;
  for (let index = 0; index < characterDocs.length; index++) {
    const element = characterDocs[index];
    if(element._id == ccharacterid){
      ccharacter = element.name;
    }
  }
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/rounds.ejs", {quote,Movie,character,cMovie,ccharacter});
});



app.get("/suddendeath", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/suddendeath.ejs");
});

app.get("/favourites", async (req, res) => {
  let user = await client
  .db("fellowship")
  .collection("users")
  .findOne({_id: new ObjectId(req.session.userId)});

  interface Favorites {
    _id: ObjectId,
    userId: ObjectId,
    quoteId: string[]
  }

  let favorites : any = await client
  .db("fellowship")
  .collection("favorites")
  .find({userId: user?._id})
  .toArray();

  let quotesArray = favorites[0].quoteId;
  let quotesDialog: string[] = [];
  let characterIds : string[] = [];
  let charactersName : string[] = [];
  
  
  let quotes : Quote[] = await client
  .db("fellowship")
  .collection("quotes")
  .find<Quote>({})
  .toArray();

  for (let i = 0; i < quotesArray.length; i++) {
    for (let j = 0; j < quotes.length; j++) {
      if (quotesArray[i] == quotes[j]._id) {
        quotesDialog.push(quotes[j].dialog)
        characterIds.push(quotes[j].character)
      }
    }
  }

  let characters = await client
    .db("fellowship")
    .collection("characters")
    .find<Character>({})
    .toArray();
  
    for (let i = 0; i < characterIds.length; i++) {
      for (let j = 0; j < characters.length; j++) {
        if (characterIds[i] == characters[j]._id) {
          charactersName.push(characters[j].name)
        }
        
      }
      
    }
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/favourites.ejs", {quotesDialog, charactersName});
});

app.get("/blacklist", (req, res) => {
  res.type("text/html");
  res.render("/workspaces/The_Fellowship/public/views/blacklist.ejs");
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
