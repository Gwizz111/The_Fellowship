import express from "express";
import { randomInt } from "crypto";
import CryptoJS from "crypto-js";
import {MongoClient, ObjectId, Document, PushOperator, PullOperator} from "mongodb";
import session from "express-session";

declare module 'express-session' {
  interface SessionData {
      userId?: ObjectId;
      quoteId?: string;
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
app.use(express.urlencoded({ extended:true}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended:true}));

app.get("/", (req, res) => {
  res.type("text/html");
  res.render("../public/views/index.ejs");
});

app.get("/login", (req: any, res: any) => {
  let failed: boolean = false;
  if (req.query.failed == "true") {
    failed = true;
  }
  res.type("text/html");
  res.render("../public/views/login.ejs", {
    failed: failed,
  });
});

interface User {
  _id?: ObjectId;
  username: string;
  password: string;
  highscoreRounds: number;
  highscoreSuddenDeath: number;
}

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
  res.render("../public/views/registreer.ejs");
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
    let newUser:User = {username: formUsername, password: encryptedPassword,highscoreRounds: 0, highscoreSuddenDeath: 0};
    client.db("fellowship")
    .collection("users")
    .insertOne(newUser);
    req.session.userId = newUser._id;
    let newFavorites = {userId: new ObjectId(req.session.userId), quoteId: []};
    client.db("fellowship")
    .collection("favorites")
    .insertOne(newFavorites)
    let newBlacklists =  {userId: new ObjectId(req.session.userId), quoteId: []};
    client.db("fellowship")
    .collection("blacklists")
    .insertOne(newBlacklists)
    res.redirect("/homepage")
  }
});



app.get("/homepage", async (req, res) => {
  try {
    let responseMovies = await fetch("https://the-one-api.dev/v2/Movie", { headers, });
    let dataMovies = await responseMovies.json();
    MovieData = dataMovies;
    MovieDocs = MovieData.docs;
    await client.db("fellowship").collection("movies").insertMany(MovieDocs);
    let responseQuotes = await fetch("https://the-one-api.dev/v2/quote", { headers, });
    let dataQuotes = await responseQuotes.json();
    quotesData = dataQuotes;
    quotesDocs = quotesData.docs;
    await client.db("fellowship").collection("movies").insertMany(quotesDocs);
    let responseCharacters = await fetch("https://the-one-api.dev/v2/character", { headers, });
    let dataCharacters = await responseCharacters.json();
    characterData = dataCharacters;
    characterDocs = characterData.docs;
    await client.db("fellowship").collection("movies").insertMany(characterDocs);
  } catch (error) {
  }

  let userHighscores = await client.db("fellowship").collection("users").findOne({_id: new ObjectId(req.session.userId)})
  let highscoreRounds = userHighscores?.highscoreRounds;
  let highscoreSuddenDeath = userHighscores?.highscoreSuddenDeath;
  res.type("text/html");
  res.render("../public/views/homepage.ejs", { highscoreRounds, highscoreSuddenDeath});
});

app.post("/favouriteQuote", async (req, res) =>{
  favorite(req.session.userId as ObjectId, req.session.quoteId as string, false);
})
app.post("/favouriteDelete", async (req, res) =>{
  const id = req.body.quoteId;
  favorite(req.session.userId as ObjectId, id, true);
  res.redirect("/favourites");
})
app.post("/blacklistChar", async (req, res) =>{
  let user = await client
  .db("fellowship")
  .collection("users")
  .findOne({_id: new ObjectId(req.session.userId)});

  interface Blacklists {
    quoteId: string;
    quoteDialog: string;
    characterName: string;
  }

  let quoteDialogAndCharacter2: Blacklists[] = [];

  let blacklists : any = await client
  .db("fellowship")
  .collection("blacklists")
  .find({userId: user?._id})
  .toArray();
  let quotesArray = blacklists[0].quoteId;
  let quotesDialog: string[] = [];
  let characterIds : string[] = [];
  let charactersName : string[] = [];
  let quotesId: string[] = [];


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
        quotesId.push(quotes[j]._id)
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

  for (let i = 0; i < quotesDialog.length; i++) {
    let dialogAndCharacter:Blacklists = {quoteId:quotesId[i] ,quoteDialog:quotesDialog[i], characterName: charactersName[i]} 
    quoteDialogAndCharacter2.push(dialogAndCharacter)
  }

  const characterName = req.body.characterName;
  let quoteDialogAndCharacter: Blacklists[] = []; 
  for (let index = 0; index < quoteDialogAndCharacter2.length; index++) {
    if (quoteDialogAndCharacter2[index].characterName==characterName) {
      quoteDialogAndCharacter.push(quoteDialogAndCharacter2[index]);
    }
  }

  res.type("text/html");
  res.render("../public/views/blacklist.ejs", {quoteDialogAndCharacter});
});

app.post("/favouriteChar", async (req, res) =>{
  interface Favorites {
    quoteId: string;
    quoteDialog: string;
    characterName: string;
  }

  let quoteDialogAndCharacter2: Favorites[] = [];

  let favorites : any = await client
  .db("fellowship")
  .collection("favorites")
  .find({userId: new ObjectId(req.session.userId)})
  .toArray();
  let quotesArray = favorites[0].quoteId;
  let quotesDialog: string[] = [];
  let characterIds : string[] = [];
  let charactersName : string[] = [];
  let quotesId: string[] = [];


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
        quotesId.push(quotes[j]._id)
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
  for (let i = 0; i < quotesDialog.length; i++) {
    let dialogAndCharacter:Favorites = {quoteId:quotesId[i] ,quoteDialog:quotesDialog[i], characterName: charactersName[i]} 
    quoteDialogAndCharacter2.push(dialogAndCharacter)
    }

  const characterName = req.body.characterName;
  let quoteDialogAndCharacter: Favorites[] = [];
    for (let index = 0; index < quoteDialogAndCharacter2.length; index++) {
      if (quoteDialogAndCharacter2[index].characterName==characterName) {
        quoteDialogAndCharacter.push(quoteDialogAndCharacter2[index]);
      }
    }
    res.type("text/html");
    res.render("../public/views/favourites.ejs", {quoteDialogAndCharacter});
})
app.post("/blacklistDelete", async (req, res) =>{
  const id = req.body.quoteId;
  blacklist(req.session.userId as ObjectId, id, true);
  res.redirect("/blacklist");
})
app.post("/blacklistQuote", async (req, res) =>{
  blacklist(req.session.userId as ObjectId, req.session.quoteId as string, false);
})
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
    .db("fellowship")
    .collection("favorites")
    .findOne({ userId: new ObjectId(userId), quoteId: quoteId });

  if (hasFavorite != null || (hasFavorite != undefined && remove == false)) {
    let deleteQuote = await client
      .db("fellowship")
      .collection("favorites")
      .updateOne(
        { userId: new ObjectId(userId) },
        { $pull: { quoteId: quoteId } as unknown as PullOperator<Document> }
      );
  }
  if (remove == false) {
    let addQuote = await client
    .db("fellowship")
    .collection("blacklists")
    .updateOne(
      { userId: new ObjectId(userId) },
      { $push: { quoteId: quoteId } as unknown as PushOperator<Document>}
    );
  }
  else if (remove == true) {
    let deleteQuote = await client
    .db("fellowship")
    .collection("blacklists")
    .updateOne(
      { userId: new ObjectId(userId) },
      { $pull: { quoteId: quoteId } as unknown as PullOperator<Document> }
    )
  }
}

const checkHighscore = async (userId:ObjectId,score: number,gamemode: string) => {
  let user = await client
  .db("fellowship")
  .collection("users")
  .findOne({_id: new ObjectId(userId)});

  let highscoreRounds = user?.highscoreRounds;
  let highscoreSuddenDeath = user?.highscoreSuddenDeath;

  if (gamemode == "rounds" && score > highscoreRounds) {
   let updateHighscoreRounds = await client
   .db("fellowship")
   .collection("users")
   .updateOne({_id: new ObjectId(userId)}, {$set: {highscoreRounds: score}}) 
  }
  else if (gamemode == "suddenDeath" && score > highscoreSuddenDeath) {
    let updateHighscoreSuddenDeath = await client
   .db("fellowship")
   .collection("users")
   .updateOne({_id: new ObjectId(userId)}, {$set: {highscoreSuddenDeath: score}})
  }
}

interface Question {
  text: string;
  movie: string[];
  answers: string[];
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

//The One API


let score: number = 0;
let counter10: number = 0;

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
  counter10 = 1;
  score = 0;
  let quotes = await client
    .db("fellowship")
    .collection("quotes")
    .find<Quote>({}).toArray();
  let blacklists : any = await client
  .db("fellowship")
  .collection("blacklists")
  .find({userId: new ObjectId(req.session.userId)})
  .toArray();
  let blacklistsIds = blacklists[0].quoteId;
  for (let i = 0; i < quotes.length; i++) {
    for (let j = 0; j < blacklistsIds.length; j++) {
      if (quotes[i]._id == blacklistsIds[j]) {
        quotes.splice(i,1)
      } 
    }
  }
  quotesDocs = quotes;
  quotePick = Math.floor(Math.random() * quotesDocs.length);

  quoteid = quotesDocs[quotePick].id;
  req.session.quoteId = quoteid;
  quote = quotesDocs[quotePick].dialog;

  if (!quote.includes('"')) {
    quote = '"' + quote + '"';
  }

  let movies = await client
    .db("fellowship")
    .collection("movies")
    .find<Movie>({}).toArray();
  MovieDocs = movies;
  cMovieid = quotesDocs[quotePick].movie;
  
  for (let index = 0; index < MovieDocs.length; index++) {
    const element = MovieDocs[index];
    if(element._id == cMovieid){
      cMovie = element.name;
    }
  }

  do{
    MoviePick = Math.floor(Math.random() * MovieDocs.length);
    Movieid = MovieDocs[MoviePick].id;
    Movie = MovieDocs[MoviePick].name;
  } while(Movie=="The Lord of the Rings Series" || Movie=="The Hobbit Series" || Movie===cMovie);

  do{
    MoviePick = Math.floor(Math.random() * MovieDocs.length);
    Movieid = MovieDocs[MoviePick].id;
    Movie2 = MovieDocs[MoviePick].name;
  } while(Movie2=="The Lord of the Rings Series" || Movie2=="The Hobbit Series" || Movie2===cMovie || Movie2===Movie);

  let characters = await client
    .db("fellowship")
    .collection("characters")
    .find<Character>({}).toArray();
  
  characterDocs = characters;
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
  res.render("../public/views/rounds.ejs", {chosenQuote,score});
});

app.get("/suddendeath", async(req, res) => {
  score=0;
  let quotes = await client
    .db("fellowship")
    .collection("quotes")
    .find<Quote>({}).toArray();
  let blacklists : any = await client
  .db("fellowship")
  .collection("blacklists")
  .find({userId: new ObjectId(req.session.userId)})
  .toArray();
  let blacklistsIds = blacklists[0].quoteId;
  for (let i = 0; i < quotes.length; i++) {
    for (let j = 0; j < blacklistsIds.length; j++) {
      if (quotes[i]._id == blacklistsIds[j]) {
        quotes.splice(i,1)
      } 
    }
  }
  quotesDocs = quotes;
  quotePick = Math.floor(Math.random() * quotesDocs.length);

  quoteid = quotesDocs[quotePick].id;
  req.session.quoteId = quoteid;
  quote = quotesDocs[quotePick].dialog;

  if (!quote.includes('"')) {
    quote = '"' + quote + '"';
  }

  let movies = await client
    .db("fellowship")
    .collection("movies")
    .find<Movie>({}).toArray();
  MovieDocs = movies;
  cMovieid = quotesDocs[quotePick].movie;
  
  for (let index = 0; index < MovieDocs.length; index++) {
    const element = MovieDocs[index];
    if(element._id == cMovieid){
      cMovie = element.name;
    }
  }

  do{
    MoviePick = Math.floor(Math.random() * MovieDocs.length);
    Movieid = MovieDocs[MoviePick].id;
    Movie = MovieDocs[MoviePick].name;
  } while(Movie=="The Lord of the Rings Series" || Movie=="The Hobbit Series" || Movie===cMovie);

  do{
    MoviePick = Math.floor(Math.random() * MovieDocs.length);
    Movieid = MovieDocs[MoviePick].id;
    Movie2 = MovieDocs[MoviePick].name;
  } while(Movie2=="The Lord of the Rings Series" || Movie2=="The Hobbit Series" || Movie2===cMovie || Movie2===Movie);

  let characters = await client
    .db("fellowship")
    .collection("characters")
    .find<Character>({}).toArray();
  
  characterDocs = characters;
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
  res.render("../public/views/suddendeath.ejs",{chosenQuote,score});
});


app.get("/favourites", async (req, res) => {
  interface Favorites {
    quoteId: string;
    quoteDialog: string;
    characterName: string;
  }

  let quoteDialogAndCharacter: Favorites[] = [];

  let favorites : any = await client
  .db("fellowship")
  .collection("favorites")
  .find({userId: new ObjectId(req.session.userId)})
  .toArray();
  let quotesArray = favorites[0].quoteId;
  let quotesDialog: string[] = [];
  let characterIds : string[] = [];
  let charactersName : string[] = [];
  let quotesId: string[] = [];


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
        quotesId.push(quotes[j]._id)
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
  for (let i = 0; i < quotesDialog.length; i++) {
    let dialogAndCharacter:Favorites = {quoteId:quotesId[i] ,quoteDialog:quotesDialog[i], characterName: charactersName[i]} 
    quoteDialogAndCharacter.push(dialogAndCharacter)
    }
  res.type("text/html");
  res.render("../public/views/favourites.ejs", {quoteDialogAndCharacter});
});

app.get("/blacklist", async (req, res) => {
  let user = await client
  .db("fellowship")
  .collection("users")
  .findOne({_id: new ObjectId(req.session.userId)});

  interface Blacklists {
    quoteId: string;
    quoteDialog: string;
    characterName: string;
  }

  let quoteDialogAndCharacter: Blacklists[] = [];

  let blacklists : any = await client
  .db("fellowship")
  .collection("blacklists")
  .find({userId: user?._id})
  .toArray();
  let quotesArray = blacklists[0].quoteId;
  let quotesDialog: string[] = [];
  let characterIds : string[] = [];
  let charactersName : string[] = [];
  let quotesId: string[] = [];


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
        quotesId.push(quotes[j]._id)
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
  for (let i = 0; i < quotesDialog.length; i++) {
    let dialogAndCharacter:Blacklists = {quoteId:quotesId[i] ,quoteDialog:quotesDialog[i], characterName: charactersName[i]} 
    quoteDialogAndCharacter.push(dialogAndCharacter)
  }
  res.type("text/html");
  res.render("../public/views/blacklist.ejs", {quoteDialogAndCharacter});
});

app.get("/gameover", (req, res) => {
  res.type("text/html");
  res.render("../public/views/gameOver.ejs", {score})
});

app.post("/rounds",async (req, res) => {
  if(counter10<10){
    counter10++;
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
      let quotes = await client
      .db("fellowship")
      .collection("quotes")
      .find<Quote>({}).toArray();
      quotesDocs = quotes; 
      quotePick = Math.floor(Math.random() * quotesDocs.length);
    
      quoteid = quotesDocs[quotePick].id;
      quote = quotesDocs[quotePick].dialog;
    
      if (!quote.includes('"')) {
        quote = '"' + quote + '"';
      }
    
      let movies = await client
      .db("fellowship")
      .collection("movies")
      .find<Movie>({}).toArray();
      MovieDocs = movies;
      for (let index = 0; index < MovieDocs.length; index++) {
        const element = MovieDocs[index];
        if(element._id == cMovieid){
          cMovie = element.name;
        }
      }
    
      do{
        MoviePick = Math.floor(Math.random() * MovieDocs.length);
        Movieid = MovieDocs[MoviePick].id;
        Movie = MovieDocs[MoviePick].name;
      } while(Movie=="The Lord of the Rings Series" || Movie=="The Hobbit Series" || Movie===cMovie);
    
      do{
        MoviePick = Math.floor(Math.random() * MovieDocs.length);
        Movieid = MovieDocs[MoviePick].id;
        Movie2 = MovieDocs[MoviePick].name;
      } while(Movie2=="The Lord of the Rings Series" || Movie2=="The Hobbit Series" || Movie2===cMovie || Movie2===Movie);
    
    
      let characters = await client
      .db("fellowship")
      .collection("characters")
      .find<Character>({}).toArray();
    
      characterDocs = characters;
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
    res.render("../public/views/rounds.ejs", {chosenQuote, score});
  }else{
      checkHighscore(req.session.userId as ObjectId, score, "rounds");
    res.type("text/html");
    res.render("../public/views/gameOver.ejs", {score})
  }
  
});

app.post("/suddendeath",async (req, res) => {

  const givenCharacter = req.body.selectedCharacter;
  const givenMovie = req.body.selectedMovie;
  const correctCharacter = ccharacter;
  const correctMovie = cMovie;
  if(givenCharacter === correctCharacter && givenMovie === correctMovie){

  if (givenCharacter === correctCharacter && givenMovie === correctMovie) {
    score = score + 1;
  }
  if (
    (givenCharacter === correctCharacter && givenMovie !== correctMovie) ||
    (givenCharacter !== correctCharacter && givenMovie === correctMovie)
  ) {
    score = score + 0.5;
  }
    let quotes = await client
    .db("fellowship")
    .collection("quotes")
    .find<Quote>({}).toArray();
    quotesDocs = quotes; 
    quotePick = Math.floor(Math.random() * quotesDocs.length);
  
    quoteid = quotesDocs[quotePick].id;
    quote = quotesDocs[quotePick].dialog;
  
    if (!quote.includes('"')) {
      quote = '"' + quote + '"';
    }
  
    let movies = await client
    .db("fellowship")
    .collection("movies")
    .find<Movie>({}).toArray();
    MovieDocs = movies;
    for (let index = 0; index < MovieDocs.length; index++) {
      const element = MovieDocs[index];
      if(element._id == cMovieid){
        cMovie = element.name;
      }
    }
  
    do{
      MoviePick = Math.floor(Math.random() * MovieDocs.length);
      Movieid = MovieDocs[MoviePick].id;
      Movie = MovieDocs[MoviePick].name;
    } while(Movie=="The Lord of the Rings Series" || Movie=="The Hobbit Series" || Movie===cMovie);
  
    do{
      MoviePick = Math.floor(Math.random() * MovieDocs.length);
      Movieid = MovieDocs[MoviePick].id;
      Movie2 = MovieDocs[MoviePick].name;
    } while(Movie2=="The Lord of the Rings Series" || Movie2=="The Hobbit Series" || Movie2===cMovie || Movie2===Movie);
  
  
    let characters = await client
    .db("fellowship")
    .collection("characters")
    .find<Character>({}).toArray();
  
    characterDocs = characters;
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
  res.render("../public/views/suddendeath.ejs", {chosenQuote, score});
}
else{
  checkHighscore(req.session.userId as ObjectId, score, "suddenDeath");
  res.type("text/html");
  res.render("../public/views/gameOver.ejs", {score})
}
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
