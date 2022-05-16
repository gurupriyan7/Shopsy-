var db = require("../config/connection");
var collection = require("../config/collections");
const bcrypt = require("bcrypt");
const { reject, promise } = require("bcrypt/promises");
const async = require("hbs/lib/async");
const { response, disabled } = require("../app");
const { ObjectId } = require("mongodb");
const Razorpay = require("razorpay");
const { CallPage } = require("twilio/lib/rest/insights/v1/call");
const { resolve } = require("path");
const moment = require("moment");
const { ObjectID } = require("bson");
const req = require("express/lib/request");
var instance = new Razorpay({
  key_id: "rzp_test_sRomirPdgXvtzH",
  key_secret: "HBrlZ2Eb0Ewma4t3TZVWQqnW",
});
module.exports = {
  // user-signup
  doSignup: (UserData) => {
    return new Promise(async (resolve, reject) => {

      if (UserData.wallet) {
        let mainUser=await db.get().collection(collection.USER_COLLECTION).findOne({_id:UserData.referedBy})
        if(mainUser.wallet<200){
          await db.get().collection(collection.USER_COLLECTION).updateOne({ _id: UserData.referedBy }, { $inc: { wallet: 50 } });
        }
      }
    UserData.wallet = UserData.wallet ? UserData.wallet : 0;

      UserData.Password = await bcrypt.hash(UserData.Password, 10);

      db.get()
        .collection(collection.USER_COLLECTION)
        .insertOne({
          Name: UserData.Name,
          Email: UserData.Email,
          PhoneNumber: UserData.PhoneNumber,
          Password: UserData.Password,
          Status: true,
          date: moment(new Date()).format("YYYY/MM/DD"),
          refer:UserData.refer,
          referedBy:UserData.referedBy,
          wallet:UserData.wallet
        })
        .then((data) => {
          resolve(data.insertedId);
        });
    });
  },

  // check-user-exists
  findExist: (Data) => {
    return new Promise(async (resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({
          $or: [{ Email: Data.Email }, { PhoneNumber: Data.PhoneNumber }],
        })
        .then((status) => {
          resolve(status);
        });
    });
  },

  // user-login
  doLogin: (UserData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ Email: UserData.Email });
      if (user) {
        bcrypt.compare(UserData.Password, user.Password).then((status) => {
          if (status) {
            response.user = user;
            response.status = true;
            resolve(response);
          } else {
            resolve({ status: false });
          }
        });
      } else {
        resolve({ status: false });
      }
    });
  },

  // block-user
  blockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              Status: false,
            },
          }
        )
        .then((data) => {
          resolve(data);
        });
    });
  },

  // unblock-user
  unBlockUser: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              Status: true,
            },
          }
        )
        .then(() => {
          resolve(true);
        });
    });
  },

  // find-user
  findUser: (num) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .findOne({ PhoneNumber: num })
        .then((response) => {
          resolve(response);
        });
    });
  },
  userFind: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) });
      resolve(user);
    });
  },
  // edit-profile
  editProfile: (userId, UserData) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $set: {
              Name: UserData.Name,
              Email: UserData.Email,
              PhoneNumber: UserData.PhoneNumber,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },

  //password-check-in-change-password
  passwordMatch: (oldPassword, userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) });
      if (user) {
        bcrypt.compare(oldPassword, user.Password).then((response) => {
          resolve(response);
        });
      }
    });
  },
  // change-password
  updatePassword: (newPassword, userId) => {
    return new Promise(async (resolve, reject) => {
      newPassword = await bcrypt.hash(newPassword, 10);
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },

          {
            $set: {
              Password: newPassword,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  // find-the-products-with-category
  findProductWithCatagory: (data) => {
    return new Promise(async (resolve, reject) => {
      let products = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ Catagory: ObjectId(data) })
        .toArray();
      resolve(products);
    });
  },

  // product-added-to-cart
  addedToCart: (proId, userId, product) => {
    let proObj = {
      item: ObjectId(proId),
      quantity: 1,
      Title: product.Title,
      Description: product.Description,
      
    };
    return new Promise(async (resolve, reject) => {
      let userCart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (userCart) {
        let proExist = userCart.products.findIndex(
          (product) => product.item == proId
        );

        if (proExist != -1) {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId), "products.item": ObjectId(proId) },

              {
                $inc: { "products.$.quantity": 1 },
              }
            )
            .then(() => {
              resolve();
            });
        } else {
          db.get()
            .collection(collection.CART_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: {
                  products: proObj,
                },
              }
            )
            .then((response) => {
              resolve(response);
            });
        }
      } else {
        let cartObj = {
          user: ObjectId(userId),
          products: [proObj],
        };
        db.get()
          .collection(collection.CART_COLLECTION)
          .insertOne(cartObj)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
  // added-to-wishList
  addedToWishList: (proId, userId) => {
    let proObj = {
      item: ObjectId(proId),
    };
    return new Promise(async (resolve, reject) => {
      let userWish = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (userWish) {
        let proExist = userWish.wishList.findIndex((pro) => pro.item == proId);
        if (proExist == -1) {
          db.get()
            .collection(collection.WISHLIST_COLLECTION)
            .updateOne(
              { user: ObjectId(userId) },
              {
                $push: {
                  wishList: proObj,
                },
              }
            )
            .then((response) => {
              resolve(response);
            });
        }
      } else {
        let wishObj = {
          user: ObjectId(userId),
          wishList: [proObj],
        };
        db.get()
          .collection(collection.WISHLIST_COLLECTION)
          .insertOne(wishObj)
          .then((response) => {
            resolve(response);
          });
      }
    });
  },
  getWishProducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let wishItems = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$wishList",
          },
          {
            $project: {
              item: "$wishList.item",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
      resolve(wishItems);
    });
  },

  // take-cart-products
  getCartproducts: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cartItems = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
        ])
        .toArray();
       


      resolve(cartItems);
      
    });
  },

  // take-cart-count
  getCartCount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      if (cart) {
        count = cart.products.length;
      }
      resolve(count);
    });
  },

  //change-the-quantity-of-product-in-cart
  changeProductQuantity: (details) => {
    count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
      if (details.count == -1 && details.quantity == 1) {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            { _id: ObjectId(details.cart) },
            {
              $pull: { products: { item: ObjectId(details.product) } },
            }
          )
          .then((response) => {
            resolve({ removeProduct: true });
          });
      } else {
        db.get()
          .collection(collection.CART_COLLECTION)
          .updateOne(
            {
              _id: ObjectId(details.cart),
              "products.item": ObjectId(details.product),
            },

            {
              $inc: { "products.$.quantity": count },
            }
          )
          .then((response) => {
            resolve(response);
          });
      }
    });
  },

  // remove-product-from-cart
  removeCartProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .updateOne(
          { _id: ObjectId(details.cart) },
          {
            $pull: { products: { item: ObjectId(details.product) } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },

  // clear-cart
  clearCart: (userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.CART_COLLECTION)
        .deleteOne({ user: ObjectId(userId) })
        .then((response) => {
          resolve(response.insertedId);
        });
    });
  },
  // get-the-total-amount-of-cart
  getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .aggregate([
          {
            $match: { user: ObjectId(userId) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: collection.PRODUCT_COLLECTION,
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: [
                    { $toInt: "$quantity" },
                    { $toInt: "$product.Price" },
                  ],
                },
              },
            },
          },
        ])
        .toArray();

      resolve(total[0]?.total);
    });
  },
  // place-order
  placeOrder: (order, products, total,totalPrice,coupon,wallet,couponDiscount,walletDiscount) => {
    return new Promise((resolve, reject) => {
     
      var dat = new Date().toISOString();
      var dates = moment(dat).format("YYYY/MM/DD");

      let status = order["payment-method"] === "COD" ? "placed" : "pending";
      let cStatus=false;
      let wStatus=false;
      let noOffer=false;
      let CandW=false;
      
      if(coupon){
       cStatus=true

      }
      if(wallet){
        wStatus=true
      }
      if(!coupon&&!wallet){
        noOffer=true;
      }
      if(wallet&&coupon){
        CandW=true
      }
      
      let orderObj = {
        deliveryDetails: {
          phoneNumber: order.PhoneNumber,
          houseName: order.houseName,
          pinCode: order.pinCode,
          city: order.city,
          name: order.name,
          
          

        },
        userId: ObjectId(order.userId),
        paymentMethod: order["payment-method"],
        products: products,
        totalAmount:total,
        oldTotal:totalPrice,
        status: status,
        cancel: false,
        delivery: false,
        date: dates,
        couponStatus:cStatus,
          walletStatus:wStatus,
          couponDiscount:couponDiscount,
          walletDiscount:walletDiscount,
          noOffer:noOffer,
          CandW:CandW
      };
      console.log('this is:',orderObj);
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .insertOne(orderObj)
        .then((response) => {
          resolve(response.insertedId);
        });
    });
  },
  // get-cart-products
  getCartProductList: (userId) => {
    return new Promise(async (resolve, reject) => {
      let cart = await db
        .get()
        .collection(collection.CART_COLLECTION)
        .findOne({ user: ObjectId(userId) });
      resolve(cart?.products);
    });
  },
  // orders-list
  getUserOrders: (userId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find({ userId: ObjectId(userId) })
        .sort({ $natural: -1 })
        .toArray();
      resolve(order);
    });
  },
  // cancel-order
  removeOrder: (details) => {
    
    return new Promise((resolve, reject) => {
      
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(details.order) },
          {
            $set: {
              status: "Cancelled",
              cancel: true,
            },
          }
        )
        .then((response) => {
          resolve(response);
        });
    });
  },
  // add-address
  addAddress: (userId, data) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) });
      
      if (user) {
        data._id = ObjectId();
        if (user.address) {
          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { _id: ObjectId(userId) },
              {
                $push: { address: data },
              }
            )
            .then((response) => {
              resolve(response);
            })
            .catch((err) => {
              resolve(err);
            });
        } else {
          let add = [data];
          db.get()
            .collection(collection.USER_COLLECTION)
            .updateOne(
              { _id: ObjectId(userId) },
              {
                $set: {
                  address: add,
                },
              }
            )
            .then((response) => {
              resolve(response);
            })
            .catch((err) => {
              resolve(err);
            });
        }
      }
    });
  },
  // get-All-Address
  getAllAddress: (userId) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ _id: ObjectId(userId) });
      resolve(user.address);
    });
  },
  // find-address-for-edit
  findAddress: (userId, addId) => {
    return new Promise(async (resolve, reject) => {
      let address = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .aggregate([
          {
            $match: {
              _id: ObjectId(userId),
            },
          },
          {
            $unwind: "$address",
          },
          {
            $match: {
              "address._id": ObjectId(addId),
            },
          },
          {
            $project: {
              _id: 0,
              address: 1,
            },
          },
        ])
        .toArray();
      resolve(address[0]?.address);
    });
  },
  // edit-address
  editAddress: (userId, data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId), "address._id": ObjectId(data.addId) },
          {
            $set: {
              "address.$.name": data.name,
              "address.$.houseName": data.houseName,
              "address.$.city": data.city,
              "address.$.pinCode": data.pinCode,
              "address.$.phoneNumber": data.phoneNumber,
            },
          }
        )
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          resolve(err);
        });
    });
  },
  // delete-address
  deleteAddress: (userId, data) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userId) },
          {
            $pull: { address: { _id: ObjectId(data.addId) } },
          }
        )
        .then((response) => {
          resolve(response);
        })
        .catch((err) => {
          resolve(err);
        });
    });
  },
  // razorpay-generating
  generateRazorpay: (orderId, totalPrice) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: totalPrice * 100,
        currency: "INR",
        receipt: "" + orderId,
      };
      instance.orders.create(options, function (err, order) {
        
        resolve(order);
      });
    });
  },
  // payment-verification
  verifyPayment: (details) => {
  
    return new Promise((resolve, reject) => {
      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "HBrlZ2Eb0Ewma4t3TZVWQqnW");

      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },
  // change-payment-status
  changePaymentStatus: (orderId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.ORDER_COLLECTION)
        .updateOne(
          { _id: ObjectId(orderId) },
          {
            $set: {
              status: "placed",
            },
          }
        )
        .then(() => {
          resolve();
        })
        .catch((err) => {
          resolve(err);
        });
    });
  },
  // remove-product-from-wishList
  removeWishProduct: (details) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .updateOne(
          { _id: ObjectId(details.wish) },

          {
            $pull: { wishList: { item: ObjectId(details.product) } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },
  removeWishList: (proId, userId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.WISHLIST_COLLECTION)
        .updateOne(
          { user: ObjectID(userId) },
          {
            $pull: { wishList: { item: ObjectID(proId) } },
          }
        )
        .then((response) => {
          resolve({ removeProduct: true });
        });
    });
  },
  // wishlist-count
  getWishCount: (userId) => {
    
    return new Promise(async (resolve, reject) => {
      let count = 0;
      let wish = await db
        .get()
        .collection(collection.WISHLIST_COLLECTION)
        .findOne({ user: ObjectId(userId) });

      if (wish) {
        count = wish.wishList.length;
      }
      resolve(count);
     
    });
  },
  banner:()=>{
    return new Promise(async(resolve,reject)=>{
      let banner=await db.get().collection(collection.BANNER_COLLECTION).find().sort({$natural:-1}).toArray()
      resolve(banner[0])
      
    })
  },
  allBanners:()=>{
    return new Promise(async(resolve,reject)=>{
      let banners=await db.get().collection(collection.BANNER_COLLECTION).find().sort({$natural:-1}).skip(1).toArray()
      resolve(banners)
     
    })
  },
  // coupon
  couponValidate: (data, user) => {
    
    return new Promise(async(resolve,reject)=>{
        obj = {}
            let date=new Date()
            date=moment(date).format('YYYY-MM-DD')
            let coupon= await db.get().collection(collection.COUPON_COLLECTION).findOne({couponCode:data.couponCode})
           
            if(coupon){
              let couponId=coupon._id
                    let users = coupon.Users
                    let userChecker = users.includes(user)
                    if(userChecker){
                      
                        obj.couponUsed=true;
                        resolve(obj)
                    }else{
                      
                        if(date <= coupon.endDate){
                            let total = parseInt(data.total)
                            let percentage = parseInt(coupon.offerPer)
                            let discountVal = ((total * percentage) / 100).toFixed()
                            obj.total = total - discountVal
                            obj.oldTotal=total
                            obj.success = true
                            obj.couponId=couponId
                              resolve(obj)
                            
                            
                           
                        }else{
                            obj.couponExpired = true
                              
                               resolve(obj)
                        }
                    }
                }else{
                    obj.invalidCoupon = true
                    
                    resolve(obj)

                }   
         })
    },
    couponAddressAdd:(userId,Id)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:ObjectID(Id)},
                            {
                              $push:{Users:userId}
                            }).then((result)=>{
                              resolve(result)
                            })
      })
    },
    // case-return-order-amount-added-to-wallet
    
    addedToWallet:(userId,amount)=>{
      return new Promise((resolve,reject)=>{
        Amount=parseInt(amount)
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectID(userId)},
        {
          $inc:{wallet:Amount}
        }).then((response)=>{
          resolve(response)
        }).catch((err)=>{
          resolve(err)
        })
      })
    },
    applyWallet:(user,details)=>{
      return new Promise((resolve,reject)=>{
        let obj={}
        if(details.applyAmount>user.wallet){
          obj.noBalance=true
          resolve(obj)
        }else{
         
          obj.success=true;
          resolve(obj)
        }
      })
    },
    findUserWallet:(userId)=>{
      return new Promise(async(resolve,reject)=>{
        let user=await db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectID(userId)})
        resolve(user)
      })
    },
    // referal
    checkReferal: (referal) => {
      return new Promise(async (resolve, reject) => {
        let refer = await db.get().collection(collection.USER_COLLECTION).find({ refer: referal }).toArray();
        if(refer){
            resolve(refer)
        }else{
            resolve(err)
        }
      });
    },
    walletChange:(userId,amount)=>{
      return new Promise((resolve,reject)=>{
        db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectID(userId)},
          {
            $inc:{wallet:-amount}
          }).then((response)=>{
            obj.success=true
            resolve(obj)
          }).catch((err)=>{
            resolve(err)
          })
      })
    },
    searchProduct:(name)=>{
      return new Promise(async(resolve,reject)=>{
          let search= await db.get().collection(collection.PRODUCT_COLLECTION).find({Description:{$regex:new RegExp('^'+name+'.*','i')}}).toArray();
          resolve(search)
      })

  },
};
