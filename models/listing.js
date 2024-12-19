const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        // type: String,
        filename: {
            type: String,
        },
        url: {
            type: String,
            default: "https://images.pexels.com/photos/4428289/pexels-photo-4428289.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
             set: (v) => v === "" ? "https://tse1.mm.bing.net/th?id=OIP.n1d8R3WXkeDwYZjKL0qnOQHaFj&pid=Api&P=0&h=180" : v,
        },
    },
    price: Number,
    location: String,
    country: String,
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;