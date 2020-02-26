const express = require("express");
const ejs = require("ejs");
const paypal = require("paypal-rest-sdk");

paypal.configure({
  mode: "sandbox", //sandbox or live
  client_id:
    "AXLAi1CN7F4kS_iPBGG2yEk7mdJP6U1cexZkdMX5nOLGQo9WueHfA86Gb3xVulTZ49rmVVq2UNsAxThw",
  client_secret:
    "EMWZFqM8QK9yLmOIUo7YEtF9X87ZkjhID7b0o4UT1twx7E0OWm4IiaLWnrhuckuP0cToW1ozk8nPhyYg"
});

const app = express();

app.set("view engine", "ejs");

app.get("/", (req, res) => res.render("index"));

app.post("/pay", (req, res) => {
  const create_payment_json = {
    intent: "sale",
    payer: {
      payment_method: "paypal"
    },
    redirect_urls: {
      return_url: "http://localhost:4000/success",
      cancel_url: "http://localhost:4000/cancel"
    },
    transactions: [
      {
        item_list: {
          items: [
            {
              name: "item",
              sku: "item",
              price: "2.00",
              currency: "GBP",
              quantity: 1
            }
          ]
        },
        amount: {
          currency: "GBP",
          total: "2.00"
        },
        description: "payment descriptions"
      }
    ]
  };

  paypal.payment.create(create_payment_json, function(error, payment) {
    if (error) {
      throw error;
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === "approval_url") {
          res.redirect(payment.links[i].href);
        }
      }
    }
  });
});

app.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "GBP",
          total: "2.00"
        }
      }
    ]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function(
    error,
    payment
  ) {
    if (error) {
      console.log(error.response);
      throw error;
    } else {
      console.log(JSON.stringify(payment));
      res.send("Success");
    }
  });
});

app.get("/cancel", (req, res) => res.send("Cancelled"));

app.listen(4000, () => console.log("Server Started"));
