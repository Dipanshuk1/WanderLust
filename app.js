const express = require("express")
const app = express()
const mongoose = require("mongoose")
const path = require("path")
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings=require("./routes/listings.js");
const reviews=require("./routes/review.js")
const session=require("express-session")
const flash=require("connect-flash")

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";
mongoose.connect(MONGO_URL).then(() => {
    console.log("Connected to DB");
}).catch((err) => {
    console.log(err)
})

// View engine setup
app.set("view engine", "ejs")
app.set("views", path.join(__dirname, "views"))
app.engine('ejs', ejsMate);

// Middleware
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "/public")));

const sessionOptions={
    secret:"mysupersecretcode",
    resave:false,
    saveUninitialized:true,
    cookie:{
        expires:Date.now()+ 7*24*60*60*1000,
        maxAge:7*24*60*60*1000,
        httpOnly:true,
    }
};

app.get("/", (req, res) => {
    res.send("this is first API")
})

app.use(session(sessionOptions)); 
app.use(flash())

app.use((req,res,next)=>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
})

app.use("/listings",listings);
app.use("/listings/:id/reviews",reviews);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("error.ejs", { message })
})

app.listen(4000, () => {
    console.log("server is running on 4000")
})