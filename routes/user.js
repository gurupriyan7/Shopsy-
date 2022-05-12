var express = require("express");
const req = require("express/lib/request");
const { redirect, status } = require("express/lib/response");
const async = require("hbs/lib/async");
const { response } = require("../app");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var userHelpers = require("../helpers/User-helpers");
const paypal = require("paypal-rest-sdk");
const adminHelpers = require("../helpers/admin-helpers");
const createReferal = require("referral-code-generator");
require('dotenv').config()
paypal.configure({
  mode: "sandbox",
  client_id:
    process.env.PAYPAL_CLIENT_ID,
  client_secret:
    process.env.PAYPAL_CLIENT_SECRET,
});



const serviceSId = process.env.TWILIO_SERVICESID;
const accountSID = process.env.TWILIO_ACCOUNTSID;
const authToken = process.env.TWILIO_AUTHTOKEN;
const client = require("twilio")(accountSID, authToken);

/* GET home page. */
// commen-session
const verifyLogin = (req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    res.render("users/login");
  }
};

router.get("/", function (req, res) {
  let today = new Date();
  productHelpers.getAllCatagorys().then((data) => {
    productHelpers.getAllProduct().then(async (products) => {
      adminHelpers.startProductOffer(today);
      adminHelpers.startCategoryOffer(today);
      adminHelpers.startCouponOffers(today);

      userHelpers.banner().then(async (banner) => {
        userHelpers.allBanners().then(async (Banners) => {
          let coupon = await adminHelpers.getAllCoupons();
          let couponCod = coupon[0];



          let cartCount = null;
          let wishCount = null;
          if (req.session.loggedIn) {
            cartCount = await userHelpers.getCartCount(req.session.user._id);
            wishCount = await userHelpers.getWishCount(req.session.user._id);
            let user = req.session.user;


            productHelpers.wishExist(req.session.user._id).then((response) => {
              res.render("users/view-products", {
                products,
                data,
                user,
                cartCount,
                search: true,
                wishCount,
                banner,
                Banners,
                couponCod,
              });
            });
          } else {
            res.render("users/view-products", {
              data,
              products,
              search: true,
              banner,
              Banners,
              couponCod,
            });
          }
        });
      });
    });
  });
});
// login-page
router.get("/login", (req, res) => {
  productHelpers.getAllCatagorys().then((data) => {
    if (req.session.loggedIn) {
      res.redirect("/");
    } else {
      res.render("users/login", {
        loginErr: req.session.loginErr,
        UserBlockErr: req.session.UserBlockErr,
      });
      req.session.loginErr = false;
      req.session.UserBlockErr = false;
    }
  });
});
// login
router.post("/login", (req, res) => {
  userHelpers.doLogin(req.body).then((response) => {
    if (response.status) {
      if (response.user.Status) {
        req.session.loggedIn = true;
        req.session.user = response.user;
        res.redirect("/");
      } else {
        req.session.UserBlockErr = "This Account has been Blocked";
        res.redirect("/login");
      }
    } else {
      req.session.loginErr = "Invalid username or password";
      res.redirect("/login");
    }
  });
});
// user-logout
router.get("/logout", (req, res) => {
  productHelpers.wishClean(req.session.user._id).then((response) => {
    req.session.loggedIn = false;
    req.session.user = null;

    res.redirect("/login");
  });
});
// caregory-manegment
router.get("/catagory-manegment", (req, res) => {
  let catdata = req.query.cat;

  productHelpers.getAllCatagorys().then((data) => {
    userHelpers.findProductWithCatagory(catdata).then(async (products) => {
      let user = req.session.user;
      let cartCount = null;
      let wishCount = null;
      if (req.session.user) {
        wishCount = await userHelpers.getWishCount(req.session.user._id);
        cartCount = await userHelpers.getCartCount(req.session.user._id);
      }
      res.render("users/catagory-view", {
        data,
        products,
        user,
        cartCount,
        search: true,
        wishCount,
      });
    });
  });
});
// sign-up
router.get("/signup", async (req, res) => {
  let refer = (await req.query.refer) ? req.query.refer : null;
  let EmlMobErr = req.session.EmlMobErr;
  res.render("users/user-signup", { EmlMobErr, refer });
  req.session.EmlMobErr = false;
});

// signup-post
router.post("/signup", (req, res) => {
  let refer = createReferal.alphaNumeric("uppercase", 2, 3);
  req.body.refer = refer;
  if (req.body.referedBy != "") {
    userHelpers
      .checkReferal(req.body.referedBy)
      .then((data) => {
        req.body.referedBy = data[0]._id;
        req.body.wallet = 100;
        userHelpers.doSignup(req.body).then((response) => {
          res.redirect("/");
        });
      })
      .catch(() => {
        req.session.referErr = "Sorry No such Code Exists";
        res.redirect("/signup");
      });
  } else {
    userHelpers.findExist(req.body).then((status) => {
      if (status) {
        req.session.EmlMobErr = "Email or Mobile Number Alredy Exists";
        res.redirect("/signup");
      } else {
        userHelpers.doSignup(req.body).then((response) => {
          res.redirect("/login");
        });
      }
    });
  }
});

// otp-login
router.get("/otp-number", (req, res) => {
  let otpNErr = req.session.otpNumberErr;
  let UserBlockErr = req.session.UserBlockErr;
  res.render("users/otp", { otpNErr, UserBlockErr });
  req.session.otpNumberErr = false;
  req.session.UserBlockErr = false;
});
// mobile number from otp-login page
router.post("/otp-number", (req, res) => {
  userHelpers.findUser(req.body.Number).then((resolve) => {
    if (resolve) {
      if (resolve.Status) {
        client.verify
          .services(serviceSId)
          .verifications.create({
            to: `+91${req.body.Number}`,
            channel: "sms",
          })
          .then((resp) => {
            req.session.number = req.body.Number;

            res.render("users/otp-code");
          });
      } else {
        req.session.UserBlockErr = "This Account has been Blocked";
        res.redirect("/otp-number");
        req.session.UserBlockErr = false;
      }
    } else {
      req.session.otpNumberErr = "Mobile Number Not exist";
      res.redirect("/otp-number");
    }
  });
});
// verify otp-code
router.post("/otp-confirm", (req, res) => {
  let otp = req.body.otp;
  let number = req.session.number;

  client.verify
    .services(serviceSId)
    .verificationChecks.create({
      to: `+91${number}`,
      code: otp,
    })
    .then((resp) => {
      if (resp.valid) {
        userHelpers.findUser(number).then((response) => {
          req.session.loggedIn = true;
          req.session.user = response;

          res.redirect("/");
        });
      } else {
        req.session.InvalidOtp = "Invalid OTP";
        let errOtp = req.session.InvalidOtp;
        res.render("users/otp-code", { errOtp });
        req.session.InvalidOtp = false;
      }
    });
});

// resent otp

router.get("/resend-otp", (req, res) => {
  let number = req.session.number;

  client.verify
    .services(serviceSId)
    .verifications.create({
      to: `+91${number}`,
      channel: "sms",
    })
    .then((resp) => {
      res.render("users/otp-code");
    });
});
// product-image-view
router.get("/image-view", (req, res) => {
  let id = req.query.id;
  if (req.session?.user) {
    productHelpers.getAllCatagorys().then((data) => {
      productHelpers.findProduct(id).then(async (product) => {
        let wishCount = await userHelpers.getWishCount(req.session.user._id);
        let cartCount = null;
        if (req.session.user) {
          cartCount = await userHelpers.getCartCount(req.session.user._id);
        }
        let user = req.session.user;
        res.render("users/product-details-view", {
          product,
          data,
          user,
          cartCount,
          wishCount,
        });
      });
    });
  } else {
    productHelpers.findProduct(id).then((product) => {
      res.render("users/product-details-view", { product });
    });
  }
});

//cart-section
router.get("/cart", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let products = await userHelpers.getCartproducts(user._id);

  let wishCount = await userHelpers.getWishCount(req.session.user._id);

  let total = await userHelpers.getTotalAmount(req.session.user._id);

  productHelpers.getAllCatagorys().then(async (data) => {
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    res.render("users/cart", {
      user,
      data,
      products,
      cartCount,
      total,
      wishCount,
    });
  });
});
// add-product-to-cart
router.get("/added-to-cart", verifyLogin, async (req, res) => {

  let product = await productHelpers.findProduct(req.query.id);



  userHelpers
    .addedToCart(req.query.id, req.session.user._id, product)
    .then((response) => {
      res.json({ status: true });
    });
});
// added-to wishLIst
router.get("/added-to-wishList", async (req, res) => {
  let userId = req.session.user._id;
  let proId = req.query.id;
  userHelpers.addedToWishList(proId, userId).then((response) => {
    productHelpers.wishUpdate(userId, proId).then((response) => {
      productHelpers.wishTrue(userId, proId).then((response) => {
        res.json({ status: true });
      });
    });
  });
});
// change-cart-product-quantity
router.post("/change-product-quantity", (req, res, next) => {
  userHelpers.changeProductQuantity(req.body).then(async (response) => {
    response.total = await userHelpers.getTotalAmount(req.body.user);
    res.json(response);
  });
});
router.post("/remove-cart-product", (req, res) => {
  userHelpers.removeCartProduct(req.body).then((response) => {
    res.json(response);
  });
});
// check-out-page
router.get("/check-out", verifyLogin, async (req, res) => {
  productHelpers.getAllCatagorys().then(async (data) => {
    let user = req.session.user;
    let allAddress = await userHelpers.getAllAddress(user._id);
    let cartCount = await userHelpers.getCartCount(req.session.user._id);
    let total = await userHelpers.getTotalAmount(req.session.user._id);
    let wishCount = await userHelpers.getWishCount(req.session.user._id);
    let User = await userHelpers.findUserWallet(user._id);
    wallet = User.wallet;
    res.render("users/check-out", {
      total,
      data,
      user,
      cartCount,
      allAddress,
      wishCount,
      wallet,
    });
  });
});
// place-order
router.post("/place-order", verifyLogin, async (req, res) => {

  let user = req.session.user;
  if (!req.body?.addId) {
    userHelpers.addAddress(req.body.userId, req.body);
  }

  if (req.session?.couponId) {
    userHelpers.couponAddressAdd(req.body.userId, req.session.couponId);
  }
  if (req.session?.walletApply) {
    let applyPrice = req.session.walletApply;
    userHelpers.walletChange(user._id, applyPrice);
  }
  let products = await userHelpers.getCartProductList(req.body.userId);
  let totalPrice = await userHelpers.getTotalAmount(req.body.userId);
  let totalAmount = totalPrice;

  if (req.session?.couponTotal && req.session?.walletAmount) {
    totalAmount = req.session.walletAmount;
  } else {
    if (req.session?.couponTotal) {
      totalAmount = req.session.couponTotal;
    }
    if (req.session?.walletAmount) {
      totalAmount = req.session.walletAmount;
    }
  }

  userHelpers
    .placeOrder(req.body, products, totalAmount, totalPrice)
    .then((orderId) => {
      req.session.orderId = orderId;

      //  COD
      if (req.body["payment-method"] === "COD") {
        res.json({ codSuccess: true });
        //  payPal
      } else if (req.body["payment-method"] === "payPal") {


        let val = totalAmount / 74;
        let total = val.toFixed(2);
        let totals = total.toString();
        req.session.total = totals;


        const create_payment_json = {
          intent: "sale",
          payer: {
            payment_method: "paypal",
          },
          redirect_urls: {
            return_url: "http://shopsy.club/success",
            cancel_url: "http://shopsy.club/cancel",
          },
          transactions: [
            {
              item_list: {
                items: [
                  {
                    name: "Red Sox Hat",
                    sku: "001",
                    price: totals,
                    currency: "USD",
                    quantity: 1,
                  },
                ],
              },
              amount: {
                currency: "USD",
                total: totals,
              },
              description: "Hat for the best team ever",
            },
          ],
        };

        paypal.payment.create(create_payment_json, function (error, payment) {

          if (error) {
            throw error;
          } else {
            for (let i = 0; i < payment.links.length; i++) {
              if (payment.links[i].rel === "approval_url") {
                let url = payment.links[i].href;
                res.json({ url });
              } else {

              }
            }
          }
        });

        // razorpay
      } else if (req.body["payment-method"] === "razorPay") {
        userHelpers.generateRazorpay(orderId, totalAmount).then((response) => {
          res.json({ ...response, razorpaySuccess: true });
        });
      }
    });
});

router.get("/success", (req, res) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;
  let total = req.session.total;
  let totals = total.toString();

  const execute_payment_json = {
    payer_id: payerId,
    transactions: [
      {
        amount: {
          currency: "USD",
          total: totals,
        },
      },
    ],
  };

  paypal.payment.execute(
    paymentId,
    execute_payment_json,
    function (error, payment) {
      if (error) {

        throw error;
      } else {

        userHelpers.changePaymentStatus(req.session.orderId).then(() => {
          res.redirect("/order-success");
        });
      }
    }
  );
});

router.get("/cancel", verifyLogin, (req, res) => res.send("Cancelled"));

router.get("/order-success", verifyLogin, async (req, res) => {
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  let total = await userHelpers.getTotalAmount(req.session.user._id);
  let wishCount = await userHelpers.getWishCount(req.session.user._id);

  let user = req.session.user;
  userHelpers.clearCart(user._id).then(() => {
    res.render("users/order-success", { user, total, cartCount, wishCount });
  });
});

// orders
router.get("/orders", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  let wishCount = await userHelpers.getWishCount(req.session.user._id);

  let orders = await userHelpers.getUserOrders(user._id);
  productHelpers.getAllCatagorys().then((data) => {
    res.render("users/orders", { user, orders, data, cartCount, wishCount });
  });
});
// user-profile
router.get("/profile", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  let allAddress = await userHelpers.getAllAddress(user._id);
  let wishCount = await userHelpers.getWishCount(req.session.user._id);

  productHelpers.getAllCatagorys().then((data) => {
    userHelpers.userFind(user._id).then((user1) => {
      let refer = user1.refer;
      let wallet = user1.wallet;
      let referalLink = "https://shopsy.club/signup?refer=" + refer;

      res.render("users/profile", {
        user,
        data,
        cartCount,
        allAddress,
        wishCount,
        referalLink,
        wallet,
      });
    });
  });
});
// edit-profile
router.post("/edit-profile", verifyLogin, (req, res) => {
  let user = req.session.user;
  let newUser = req.body.Name;

  userHelpers.editProfile(user._id, req.body).then((response) => {


    req.session.user.Name = newUser;


    res.redirect("/profile");
  });
});
// edit-user-password
router.get("/edit-password", verifyLogin, (req, res) => {
  let passErr = req.session.passwordNotMatch;
  let user = req.session.user;
  res.render("users/edit-password", { user, passErr });
  req.session.passwordNotMatch = false;
});
router.post("/edit-password", (req, res) => {
  let userId = req.session.user._id;
  userHelpers.passwordMatch(req.body.oldPassword, userId).then((response) => {
    if (response) {
      userHelpers
        .updatePassword(req.body.newPassword, userId)
        .then((response) => {
          req.session.destroy();
          res.redirect("/login");
        });
    } else {
      req.session.passwordNotMatch = "Old Password is Wrong";
      res.redirect("/edit-password");
    }
  });
});
// cancel-order-from-orders
router.post("/remove-order", (req, res) => {
  userHelpers.removeOrder(req.body).then((response) => {
    if (
      req.body.paymentMethod == "payPal" ||
      req.body.paymentMethod == "razorPay"
    ) {
      if (req.body.paymentMethod != "pending") {
        let amountToWallet = req.body.totalAmount;

        userHelpers
          .addedToWallet(req.body.user, amountToWallet)
          .then((result) => {
            res.json({ refund: true });
          });
      } else {
        res.json(response);
      }
    } else {
      res.json(response);
    }
  });
});
// add-address
router.get("/add-address", verifyLogin, async (req, res) => {
  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  let wishCount = await userHelpers.getWishCount(req.session.user._id);
  let user = req.session.user;
  productHelpers.getAllCatagorys().then((data) => {
    res.render("users/add-address", { user, data, cartCount, wishCount });
  });
});
router.post("/add-address", (req, res) => {
  let userId = req.session.user._id;

  userHelpers.addAddress(userId, req.body).then((response) => {
    res.redirect("/profile");
  });
});
// edit-address
router.get("/edit-address", verifyLogin, async (req, res) => {
  let addId = req.query.id;
  let user = req.session.user;

  let cartCount = await userHelpers.getCartCount(req.session.user._id);
  let wishCount = await userHelpers.getWishCount(req.session.user._id);

  userHelpers.findAddress(user._id, addId).then((address) => {


    res.render("users/edit-address", { user, cartCount, address, wishCount });
  });
});
router.post("/edit-address", (req, res) => {
  let userId = req.session.user._id;

  userHelpers.editAddress(userId, req.body).then((response) => {
    res.redirect("/profile");
  });
});
// delete-address
router.post("/delete-address", (req, res) => {
  userHelpers.deleteAddress(req.session.user._id, req.body).then((response) => {
    res.json(response);
  });
});
// view-ordered-product
router.get("/view-order-products", verifyLogin, async (req, res) => {
  let ordrId = req.query.id;

  let wishCount = await userHelpers.getWishCount(req.session.user._id);
  productHelpers.findOrderProducts(ordrId).then((products) => {
    res.render("users/view-order-products", {
      user: req.session.user,
      products,
      wishCount,
    });
  });
});
// payment-verification
router.post("/verify-payment", (req, res) => {

  userHelpers.verifyPayment(req.body).then(() => {
    userHelpers
      .changePaymentStatus(req.body["order[receipt]"])
      .then(() => {

        res.json({ status: true });
      })
      .catch((err) => {

        res.json({ status: false, errMsg: "payment failed" });
      });
  });
});
// wishList
router.get("/wishList", verifyLogin, async (req, res) => {
  let products = await userHelpers.getWishProducts(req.session.user._id);
  let wishCount = await userHelpers.getWishCount(req.session.user._id);
  let cartCount = await userHelpers.getCartCount(req.session.user._id);

  res.render("users/wishlist", {
    user: req.session.user,
    products,
    wishCount,
    cartCount,
  });
});
// remove-from-wishlist
router.post("/remove-wishProduct", (req, res) => {
  userHelpers.removeWishProduct(req.body).then((response) => {
    productHelpers
      .removeWish(req.session.user._id, req.body.product)
      .then((response) => {
        res.json(response);
      });
  });
});
router.post("/remove-wish", (req, res) => {
  userHelpers
    .removeWishList(req.body.product, req.session.user._id)
    .then((result) => {
      productHelpers
        .removeWish(req.session.user._id, req.body.product)
        .then((response) => {
          res.json(result);
        });
    });
});
// coupon-apply
router.post("/apply-coupon", verifyLogin, (req, res) => {
  let Id = req.session.user._id;

  userHelpers
    .couponValidate(req.body, req.session.user._id)
    .then((response) => {
      if (response.success) {
        req.session.couponTotal = response.total;
        req.session.couponId = response.couponId;

        res.json({
          couponSuccess: true,
          total: response.total,
          oldTotal: response.oldTotal,
        });
      } else if (response.couponUsed) {
        res.json({ couponUsed: true });
      } else if (response.couponExpired) {
        res.json({ couponExpired: true });
      } else {
        res.json({ invalidCoupon: true });
      }
    });
});
// wallet-apply
router.post("/apply-wallet", async (req, res) => {
  let newPrice = req.body.total - req.body.applyAmount;

  req.session.walletAmount = newPrice;
  req.session.walletApply = req.body.applyAmount;

  let userId = req.session.user._id;
  let user = await userHelpers.findUserWallet(userId);

  userHelpers.applyWallet(user, req.body).then((response) => {
    if (response.noBalance) {
      res.json({ noBalance: true });
    } else if (response.success) {
      res.json({ success: true });
    }
  });
});
//search-products
router.post("/search", async (req, res) => {
  let payload = req.body.payload.trim();
  let search = await userHelpers.searchProduct(payload);
  search = search.slice(0, 10);
  res.send({ payload: search });
});

module.exports = router;
