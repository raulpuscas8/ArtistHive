require("dotenv").config(); // Load .env

const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

// PaymentIntent (keep as before, optional)
app.post("/create-payment-intent", async (req, res) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 500,
      currency: "ron",
      payment_method_types: ["card"],
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Checkout Session (put your new code here!)
app.post("/create-checkout-session", async (req, res) => {
  try {
    let { amount, currency, name } = req.body;

    if (!amount || !currency) {
      return res.status(400).json({ error: "Missing amount or currency" });
    }

    const allowedCurrencies = ["ron", "eur", "usd"];
    if (!allowedCurrencies.includes(currency.toLowerCase())) {
      return res.status(400).json({ error: "Unsupported currency" });
    }

    const unitAmount = Math.round(Number(amount) * 100);

    if (!unitAmount || unitAmount < 100) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: name || "ArtistHive Demo Payment",
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      success_url: "https://artist-hive-success",
      cancel_url: "https://artist-hive-cancel",
    });

    res.send({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));
