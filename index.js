const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require('dotenv').config(); // Move dotenv config to the top
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);
const mg = mailgun.client({ username: 'api', key: process.env.MAIL_GUN_API_KEY });
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.n3x8zj3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        const propertyCollection = client.db("RentRight").collection("property");
        const featureCollection = client.db("RentRight").collection("feature");
        const agentCollection = client.db("RentRight").collection("agent");
        const branchCollection = client.db("RentRight").collection("branch");
        const packageCollection = client.db("RentRight").collection("package");
        const notificationCollection = client.db("RentRight").collection("notification");
        const reviewCollection = client.db("RentRight").collection("review");
        const userCollection = client.db("RentRight").collection("users");
        const paymentCollection = client.db("RentRight").collection("payment");

        app.get('/property', async (req, res) => {

            const result = await propertyCollection.find().toArray();
            res.send(result);
        })
        app.get('/property/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await propertyCollection.findOne(query);
            res.send(result)
        })
        app.put('/property/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedProperty = req.body;

            // Build the update object dynamically
            const property = {
                $set: {}
            };

            // Check and set each field if it exists in the updatedProperty
            if (updatedProperty.name) {
                property.$set.name = updatedProperty.name;
            }
            if (updatedProperty.description) {
                property.$set.description = updatedProperty.description;
            }
            if (updatedProperty.area) {
                property.$set.area = updatedProperty.area;
            }
            if (updatedProperty.baths) {
                property.$set.baths = updatedProperty.baths;
            }
            if (updatedProperty.bed) {
                property.$set.bed = updatedProperty.bed;
            }
            if (updatedProperty.parkingSpaces) {
                property.$set.parkingSpaces = updatedProperty.parkingSpaces;
            }
            if (updatedProperty.amenities) {
                property.$set.amenities = updatedProperty.amenities;
            }
            if (updatedProperty.nearbyAmenities) {
                property.$set.nearbyAmenities = updatedProperty.nearbyAmenities;
            }
            if (updatedProperty.yearBuilt) {
                property.$set.yearBuilt = updatedProperty.yearBuilt;
            }
            if (updatedProperty.petFriendly !== undefined) {
                property.$set.petFriendly = updatedProperty.petFriendly;
            }
            if (updatedProperty.address) {
                property.$set.address = updatedProperty.address;
            }
            if (updatedProperty.condition) {
                property.$set.condition = updatedProperty.condition;
            }
            if (updatedProperty.ownerContact && updatedProperty.ownerContact.name) {
                property.$set['ownerContact.name'] = updatedProperty.ownerContact.name;
            }
            if (updatedProperty.ownerContact && updatedProperty.ownerContact.phone) {
                property.$set['ownerContact.phone'] = updatedProperty.ownerContact.phone;
            }
            if (updatedProperty.ownerContact && updatedProperty.ownerContact.email) {
                property.$set['ownerContact.email'] = updatedProperty.ownerContact.email;
            }
            if (updatedProperty.email) {
                property.$set.email = updatedProperty.email;
            }
            // Perform the update operation
            try {
                const result = await propertyCollection.updateOne(filter, property, options);
                res.send(result);
            } catch (error) {
                res.status(500).send({ error: 'Failed to update property', details: error });
            }
        });


        app.get("/propertyCount", async (req, res) => {
            try {
                const count = await propertyCollection.countDocuments({ condition: { $in: ["Rental", "Sell"] } });
                console.log(count);
                res.send({ count });
            } catch (error) {
                console.error("Error fetching count:", error);
                res.status(500).send({ error: "Internal Server Error" });
            }
        });

        app.delete('/property/:id', async (req, res) => {

            const id = req.params.id;

            const query = { _id: new ObjectId(id) }
            const result = await propertyCollection.deleteOne(query);

            res.send(result);
        })


        app.post("/property", async (req, res) => {

            const body = req.body;
            const result = await propertyCollection.insertOne(body);
            console.log(result);
            res.send(result);


        });
        app.get('/feature', async (req, res) => {

            const result = await featureCollection.find().toArray();
            res.send(result);
        })




        app.get('/agent', async (req, res) => {

            const result = await agentCollection.find().toArray();
            res.send(result);
        })




        app.get('/branch', async (req, res) => {

            const result = await branchCollection.find().toArray();
            res.send(result);
        })




        app.get('/package', async (req, res) => {

            const result = await packageCollection.find().toArray();
            res.send(result);
        })
        app.post("/package", async (req, res) => {

            const body = req.body;
            const result = await packageCollection.insertOne(body);
            console.log(result);
            res.send(result);


        });
        app.get('/package/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await packageCollection.findOne(query);
            res.send(result)
        })
        app.put('/package/:id', async (req, res) => {

            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedPackage = req.body;

            const package = {
                $set: {}
            };

            if (updatedPackage.name) {
                package.$set.name = updatedPackage.name;
            }
            if (updatedPackage.price) {
                package.$set.price = updatedPackage.price;
            }
            if (updatedPackage.benefits) {
                package.$set.benefits = updatedPackage.benefits;
            }
            if (updatedPackage.bought) {
                package.$set.bought = updatedPackage.bought;
            }

            const result = await packageCollection.updateOne(filter, package, options);
            res.send(result);
        });

        app.delete('/package/:id', async (req, res) => {

            const id = req.params.id;

            const query = { _id: new ObjectId(id) }
            const result = await packageCollection.deleteOne(query);

            res.send(result);
        })

        app.get('/notification', async (req, res) => {

            const result = await notificationCollection.find().toArray();
            res.send(result);
        })
        app.get('/notification/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await notificationCollection.findOne(query);
            res.send(result)
        })

        app.put('/notification/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) }
            const options = { upsert: true };
            const updatedNotification = req.body;

            const notification = {
                $set: {}
            };

        
            if (updatedNotification.title) {
                notification.$set.title = updatedNotification.title;
            }
            if (updatedNotification.message) {
                notification.$set.message = updatedNotification.message;
            }
            if (updatedNotification.date) {
                notification.$set.date = updatedNotification.date;
            }
            if (updatedNotification.time) {
                notification.$set.time = updatedNotification.time;
            }
          

            const result = await notificationCollection.updateOne(filter, notification, options);
            res.send(result);
        });

        app.delete('/notification/:id', async (req, res) => {

            const id = req.params.id;

            const query = { _id: new ObjectId(id) }
            const result = await notificationCollection.deleteOne(query);

            res.send(result);
        })
        app.post("/notification", async (req, res) => {

            const body = req.body;
            const result = await notificationCollection.insertOne(body);
            console.log(result);
            res.send(result);


        });
        app.get('/review', async (req, res) => {

            const result = await reviewCollection.find().toArray();
            res.send(result);
        })

        app.post('/review', async (req, res) => {
            const item = req.body;
            const result = await reviewCollection.insertOne(item);
            res.send(result);
        });


        app.get('/users', async (req, res) => {

            const result = await userCollection.find().toArray();
            res.send(result);
        })

        app.get('/users/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await userCollection.findOne(query);
            res.send(result)
        })
        app.post("/users", async (req, res) => {
            try {
                const body = req.body;
                const result = await userCollection.insertOne(body);
                console.log(result);
                res.send(result);


            } catch (error) {
                console.log(error);

            }

        });
        app.delete('/users/:id', async (req, res) => {

            const id = req.params.id;

            const query = { _id: new ObjectId(id) }
            const result = await userCollection.deleteOne(query);

            res.send(result);
        })


        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
         
            const filter = { email: email };
            const options = { upsert: true };
            const updatedUser = req.body;

            const user = {
                $set: {}
            };



            if (updatedUser.service) {
                user.$set.service = updatedUser.service;
            }


            if (updatedUser.serviceDate) {
                user.$set.serviceDate = updatedUser.serviceDate;
            }
            if (updatedUser.servicePaid) {
                user.$set.servicePaid = updatedUser.servicePaid;
            }

            const result = await userCollection.updateOne(filter, user, options);
            res.send(result);
        });

        app.post('/create-payment-intent', async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            console.log(amount, 'amount inside the intent')

            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });

            res.send({
                clientSecret: paymentIntent.client_secret
            })
        });
        app.get('/payment/:email', async (req, res) => {
            const query = { email: req.params.email }

            const result = await paymentCollection.find(query).toArray();
            res.send(result);
        })
        app.post('/payment', async (req, res) => {
        
            const payment = req.body;
            

            const paymentResult = await paymentCollection.insertOne(payment);

            // Send user email about payment confirmation
            mg.messages
                .create(process.env.MAIL_SENDING_DOMAIN, {
                    from: "Mailgun Sandbox <postmaster@sandboxfece05fe9ef54d40ba425edad5b75ef7.mailgun.org>",
                    to: ["umahtab65@gmail.com"],
                    subject: "Payment Confirmation - Thank You for Your Purchase!",
                    text: "Your payment was successfully processed.",
                    html: `
                     <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                            <h2 style="color: #333;">Thank You for Your Purchase!</h2>
                            <p>Dear Customer,</p>
                            <p>We are pleased to inform you that your payment was successfully processed. Here are the details of your transaction:</p>
                            <p><strong>Transaction ID:</strong> ${payment.transactionId}</p>
                            <p>We value your feedback! Please let us know how we can further assist you with your property needs.</p>
                            <p>Thank you for choosing our services. We look forward to serving you again!</p>
                            <p>Sincerely,</p>
                            <p>The Property Management Team</p>
                        </div>
                  `
                })
                .then(msg => console.log(msg)) // logs response data
                .catch(err => console.log(err)); // logs any error`;

            res.send(paymentResult);
        })


        // Other routes...

    } finally {
        // client.close() is removed as we are not closing the connection
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("running");
});

app.listen(port, () => {
    console.log(`running on ${port}`);
});
