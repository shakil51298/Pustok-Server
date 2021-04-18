const express = require('express')
const bodyParser = require('body-parser')
const MongoClient = require('mongodb').MongoClient;
const cors = require('cors')
require('dotenv').config()



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.bptoi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express()
const port = process.env.PORT || 5000 
app.use(bodyParser.json())
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello World!')
})


const { config } = require('dotenv')
const { ObjectID } = require('bson')



const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    const BooksCollection = client.db("BookShop").collection("Books");
    const ordersCollections = client.db("BookShopOrdersCollection").collection("orders");
    const adminsCollection = client.db("BookShopAdmin").collection("Adnims");
    const reviewCollections = client.db("bookshopReview").collection("reviews");
    app.post('/AddBookToShop', (req, res) => {
        const BooksDetails = req.body;
        BooksCollection.insertOne(BooksDetails)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })
    app.get("/AllBooks", (req, res) => {
        BooksCollection.find()
            .toArray((err, bookDocs) => {
                res.send(bookDocs)
            })
    })
    app.post("/addOrders", (req, res) => {
        const orders = req.body;
        const email = req.body.orderData.UserData.email;

        ordersCollections.insertOne(orders)
            .then(result => {
                res.send(result.insertedCount > 1)
            })
    })
    app.post('/orders', (req, res) => {
        const userEmail = req.body.userEmail;
        adminsCollection.find({ email: userEmail })
            .toArray((err, document) => {
                if (document.length === 0 && userEmail) {
                    ordersCollections.find({ 'orderData.UserData.email': userEmail })
                        .toArray((err, docus) => {
                            res.send(docus)
                        })
                }
                else {
                    ordersCollections.find({})
                        .toArray((err, orderDocus) => {
                            res.send(orderDocus)
                        })
                }
            })
    })
    app.post('/addAdmin', (req, res) => {
        const userEmails = req.body.email;
        const adminData = (req.body)
        adminsCollection.find({ email: userEmails })
            .toArray((err, documents) => {
                if (documents.length > 0) {
                    console.log('ache add kora jaby nah');
                }
                else {
                    if (userEmails) {
                        adminsCollection.insertOne(adminData)
                            .then(result => {
                                res.send(result.insertedCount > 0)
                            })
                    }
                    else {
                        console.log("email nai , add kora jaby nah");
                    }
                }
            })
    })


    app.get("/AllAdmins", (req, res) => {
        adminsCollection.find()
            .toArray((err, AdmiDocs) => {
                res.send(AdmiDocs)
            })
    })


    app.post("/isAdmin", (req, res) => {
        const AdminEmail = req.body.loggedinuserEmial;
        adminsCollection.find({ email: AdminEmail })
            .toArray((err, admins) => {
                res.send(admins.length > 0)
            })
    })

    app.post('/review', (req, res) => {
        const userReview = req.body;
        reviewCollections.insertOne(userReview)
            .then(result => {
                res.send(result.insertedCount > 0)
            })
    })

    app.get('/reviews', (req, res) => {
        reviewCollections.find()
            .toArray((err, reviewDocs) => {
                res.send(reviewDocs)
            })
    })

    app.delete('/productDelete/:id', (req, res) => {
        const id = ObjectID(req.params.id)
        BooksCollection.findOneAndDelete({ _id: id })
            .then(result => {
                res.redirect('/')
            })
    })
    app.patch('/updtaeBoooksInfo', (req, res) => {
        const prodcutId = (req.body.booksId);
        console.log(prodcutId);
        const status = req.body.statusValue;
        ordersCollections.updateOne({'orderData.books._id': prodcutId} , {
            $set : {'orderData.orderStatus' : status} ,
            $currentDate: { lastModified: true } 
        })
        .then( result => {
            console.log(result);
        })
    })
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})