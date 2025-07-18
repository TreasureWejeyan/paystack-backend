const express = require("express");
const bodyParser = require("body-parser");
const axios = require("axios");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;

app.use(bodyParser.json());

// Verify Payment
app.post("/api/verify-transaction", async (req, res) => {
  const { reference } = req.body;
  try {
    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    if (response.data.data.status === "success") {
      res.json({ success: true, message: "Payment verified." });
    } else {
      res.status(400).json({ success: false, message: "Payment not successful." });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error." });
  }
});

// Webhook
app.post("/api/paystack/webhook", (req, res) => {
  const hash = crypto
    .createHmac("sha512", PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest("hex");

  if (hash === req.headers["x-paystack-signature"]) {
    const event = req.body;
    console.log("Webhook event:", event.event);
  }

  res.sendStatus(200);
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
