const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require("paypal-rest-sdk");
const cors = require("cors");
const app = express();

app.engine("ejs", engines.ejs);
app.set("views", "./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));

paypal.configure({
    mode: "sandbox", //sandbox or live
    client_id:
        "AQnp77oIw2041oT_oJXuuz5xsqpbuOvFGe6qjLF0w0Wqrvl5autybBy4K1aiYLkthAQT0s_kgmoG98Er",
    client_secret:
        "ECUH4KUvpWKge40ThdCeBSYas4DhYI0zWiphHE_hiTqxn1MvzBSpWlX1ivydZvXIh1ozX-P5uR6xpP-f"
});
app.get("/", (req, res) => {
    console.log("********")
    res.render("index");
});

app.post("/paypal", (req, res) => {
    console.log("reqqqq", req.body.name, req.body.price, req.body.catogery, "*89889898989")
    var create_payment_json = {
        intent: "sale",
        payer: {
            payment_method: "paypal"
        },
        redirect_urls: {

            return_url: "http://umichmart.herokuapp.com/success",
            cancel_url: "http://umichmart.herokuapp.com/cancel",
        },
        transactions: [
            {
                item_list: {
                    items: [
                        {
                            name: req.body.name,
                            sku: req.body.catogery,
                            price: req.body.price,
                            currency: "USD",
                            quantity: 1
                        }
                    ]
                },
                amount: {
                    currency: "USD",
                    total: req.body.price
                },
                description: "This is the payment descriptionssss."
            }
        ]
    }

    paypal.payment.create(create_payment_json, function (error, payment) {
        
        if (error) {
            console.log(error.response);
            // throw error;
            res.render("transactionError");
        } else {
            console.log("Create Payment Response");
            console.log(payment.transactions, "ppppppppppppppp");
            // res.send(payment.links[1].href)
            console.log(payment.links[1], 'payment.links[1]')
            res.redirect(payment.links[1].href);
            // res.send("Ok")
        }
    });
});
app.get("/success", (req, res) => {
    // res.send("Success");
    // console.log(req, "----------")
   
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
   

paypal.payment.get(paymentId, function (error, payment) {
    if (error) {
        console.log(error);
        // throw error;
    } else {
        console.log("Get Payment Response");
        // console.log(JSON.stringify(payment.transactions[0].amount.total));
        let price = payment.transactions[0].amount.total

        var execute_payment_json = {
            payer_id: PayerID,
            transactions: [
                {
                    amount: {
                        currency: "USD",
                        total: price
                    }
                }
            ]
        };
    
        paypal.payment.execute(paymentId, execute_payment_json, function (
            error,
            payment
        ) {
            if (error) {
                console.log(error.response);
                // throw error;
                res.render("transactionError");
    
            } else {
                // console.log("Get Payment Response");
                // console.log(JSON.stringify(payment));
                res.render("success");
            }
        });




    }

});
  
});

// app.get("/success", (req, res) => {
//     res.render("Success");
// });

app.get("/cancel", (req, res) => {
    res.render("cancel");
});

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is runnisng");
});
