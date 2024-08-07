const { stripe } = require("../../config/stripe");

const { historyTransModel } = require("../../model/History_Trans");

exports.createPayment = async (req, res) => {
  console.log("createPayment API called");
  const { amount, company_id } = req.body;
  // Kiểm tra dữ liệu đầu vào
  if (!amount || !company_id) {
    return res.status(400).send("Missing amount or currency");
  }

  try {
    // Tạo PaymentIntent với Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "USD",
      metadata: { company_id },
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
  const { paymentIntentId, companyId, amount } = req.body;

  // Kiểm tra dữ liệu đầu vào
  if (!paymentIntentId || !companyId || !amount) {
    return res.status(400).send("Missing required fields");
  }

  try {
    // Xác thực PaymentIntent
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    const transactionStatus = `+ ${amount} USD`;

    // Lưu thông tin giao dịch vào cơ sở dữ liệu
    const transaction = new historyTransModel({
      company_id: companyId,
      amount: amount,
      currency: "USD",
      status: transactionStatus,
      transaction_date: new Date(),
    });

    await transaction.save();
    console.log("Transaction saved successfully");

    // Trả về thông tin thanh toán thành công
    res.json({
      data: transaction,
      message: "Payment confirmed and transaction saved",
    });
  } catch (error) {
    console.error("Error confirming payment:", error);
    res.status(500).send("Internal Server Error");
  }
};
