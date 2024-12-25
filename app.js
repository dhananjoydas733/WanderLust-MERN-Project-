const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride = require("method-override"); //need to install using npm i method-override
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("./schema.js")
const Review = require("./models/review.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB")
    })
    .catch((err) => {
        console.log(err);
    })

async function main() {
    await mongoose.connect(MONGO_URL)
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.get("/", (req, res) => {
    res.send("Hi i am dhananjoy")
})

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);
    
    if (error) {
        throw new ExpressError(400, result.error);
    }
    else {
        next();
    }
} 

const validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    
    if (error) {
        throw new ExpressError(400, result.error);
    }
    else {
        next();
    }
} 

//index route
app.get("/listings", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({});
    res.render( "./listing/index.ejs", { allListings });
}));

//New Route
app.get("/listings/new", (req, res)=>{
    res.render("listing/new.ejs");
});

//show Route 
app.get("/listings/:id", wrapAsync(async (req, res)=>{
    let {id} = req.params;
    const  listing = await Listing.findById(id).populate("review");
    res.render("listing/show.ejs", {listing});
}));

//Create Rooute
app.post("/listings",
    validateListing,
    wrapAsync(async (req, res, next) => {
        const newListing = new Listing(req.body.listing);
        await newListing.save();
        res.redirect("/listings");
    })
);

//Edit Route
app.get("/listings/:id/edit", wrapAsync(async (req, res)=>{
    let {id} = req.params;
    const  listing = await Listing.findById( id );
    res.render("listing/edit.ejs", { listing });
}));

//Update Route
app.put("/listings/:id",
    validateListing,
    wrapAsync(async (req, res)=> {
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`);
}));

//Delete Route
app.delete("/listings/:id", wrapAsync(async (req, res) =>{
    let { id } = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    console.log(deletedListing);
    res.redirect("/listings");
}));

// Review
//Post review Route
app.post("/listings/:id/reviews", validateReview, wrapAsync(async(req, res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.review.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`)

}));

//delete Review Route
app.delete("/listings/:id/review/:reviewsId",
    wrapAsync(async (req,res)=> {
        let { id, reviewsId} = req.params;

        await Listing.findByIdAndUpdate(id, {$pull: {review: reviewsId}});
        await Review.findByIdAndDelete(reviewsId);

        res.redirect(`/listings/${id}`);
    })
)

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing({
//         title: "My New Villa",
//         description: "By the beach",
//         price: 1200,
//         location: "calangute, Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("succesful testing");
// });

app.all("*", (req, res, next)=>{
    next(new ExpressError(404, "Page Not Found!"));
})

app.use((err, req, res, next)=>{
    let {statusCode = 500, message = "Something went Wrong"} = err;
    res.status(statusCode).render("error.ejs", {message});
    // res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Your server is listening to port 8080");
});

