const { stripe } = require("../../config/stripe");

const { historyTransModel } = require("../../model/History_Trans");

exports.createPayment = async (req, res) => {
  const { amount, currency } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!amount || !currency) {
    return res.status(400).send("Missing amount or currency");
  }

  try {
    // Tạo PaymentIntent với Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: currency,
    });

    // Trả về client_secret
    res.json({
      client_secret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      status: paymentIntent.status,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    res.status(500).send("Internal Server Error");
  }
};

exports.confirmPayment = async (req, res) => {
  const { paymentIntentId, companyId, amount, currency } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!paymentIntentId || !companyId || !amount || !currency) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Xác thực PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    // Kiểm tra trạng thái thanh toán
    if (paymentIntent.status === "succeeded") {
      // Lưu thông tin giao dịch vào cơ sở dữ liệu
      const transaction = new historyTransModel({
        company_id: companyId,
        amount: amount,
        currency: currency,
        status: paymentIntent.status,
        transaction_date: new Date(),
      });

      await transaction.save();
      console.log("Transaction saved successfully");

      // Trả về thông tin thanh toán thành công
      res.json({ message: "Payment confirmed and transaction saved" });
    } else {
      // Thanh toán không thành công
      res.status(400).send("Payment not successful");
    }
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).send("Internal Server Error");
  }
};
