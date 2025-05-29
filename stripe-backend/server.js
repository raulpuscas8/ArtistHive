const express = require("express");
const app = express();
const cors = require("cors");
const stripe = require("stripe")(
  "sk_test_51N1w2fEN9Rbh6iDjnGfAPBVGtBTr2iHG7u4ZYhE6N1ZAn6PbFrbK2LB8RKMRWI9ALBMYm7qxxkGu1wDZb6mjYYf800MkrTmVd3"
);

app.use(cors());
app.use(express.json());

// Create PaymentIntent (for CardField, not used here, but keep if needed)
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

// Create Stripe Checkout Session
app.post("/create-checkout-session", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "ron",
            product_data: {
              name: "ArtistHive Demo Payment",
            },
            unit_amount: 500, // amount in bani/cents (5 RON)
          },
          quantity: 1,
        },
      ],
      success_url: "https://www.google.com/?success=true", // <--- after payment
      cancel_url: "https://www.google.com/?canceled=true", // <--- if canceled
    });
    res.send({ url: session.url });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(4242, () => console.log("Node server listening on port 4242!"));
