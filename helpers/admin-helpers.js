var db=require('../config/connection')
var collection=require('../config/collections');
const bcrypt=require('bcrypt');
const { reject } = require('bcrypt/promises');
const { response } = require('../app');
const async = require('hbs/lib/async');
var objectId=require('mongodb').ObjectId
const moment = require('moment');


module.exports={
          adminLogin:(adminData)=>{
                    return new Promise(async(resolve,reject)=>{
                       let loginStatus=false
                       let response={}
                       let admin=await db.get().collection('admin').findOne({Email:adminData.Email})
                       if(admin){
                                 bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                                           if(status){
                                                  response.admin=admin
                                                  response.status=true
                                                  resolve(response)
                                           }else{
                                                  resolve({status:false})
                                           }
                                 })
                                
                       }else{
                                 resolve({status:false})
                       }   
                    })
          },
          findCatagory:(id)=>{
              return new Promise((resolve,reject)=>{
                db.get().collection(collection.CATAGORY_COLLECTION).findOne({_id:objectId(id)}).then((data)=>{
                  resolve(data)
                })
                
              })
            },
            editCatagory:(Id,data)=>{
              return new Promise((resolve,reject)=>{
                     
                db.get().collection(collection.CATAGORY_COLLECTION).updateOne({_id:objectId(Id)},
                  {
                    $set:{
                      Catagory:data.Catagory
                    }
                  }).then((response)=>{
                         
                    resolve(response)
                  })
              })
            },
            catagoryEdit:(id,data)=>{
              return new Promise((resolve,reject)=>{
                
                db.get().collection(collection.PRODUCT_COLLECTION).updateMany({Catagory:objectId(id) },{
                  $set:{
                  CatagoryName:data.Catagory
                }
               }).then((response)=>{
                  resolve(response)
                 
                })
              })
            },
            getAllUsers:()=>{
              return new Promise(async(resolve,reject)=>{
                     let Users= await db.get().collection(collection.USER_COLLECTION).find().toArray()
                     resolve(Users)
              })
       },
      //  order-manegment
       allOrders:()=>{
         return new Promise(async(resolve,reject)=>{
           let orders=await db.get().collection(collection.ORDER_COLLECTION).find().sort({$natural:-1}).toArray()
          
           
           resolve(orders)
         })
       },
      //  update-order-status
      updateStatus:(orderId,newStatus,cancelStatus,deliveryStatus)=>{
        return new Promise((resolve,reject)=>{
          db.get().collection(collection.ORDER_COLLECTION).updateOne({_id:objectId(orderId)},
          {
            $set:{
              status:newStatus,
              cancel:cancelStatus,
              delivery:deliveryStatus
            }
          }).then((response)=>{
            resolve(response)
          })
        })
      },
      // dashboard-monthly-report

      monthlyReport:()=>{
        return new Promise(async(resolve,reject)=>{
            let today=new Date()
            let end= moment(today).format('YYYY/MM/DD')
            let start=moment(end).subtract(30,'days').format('YYYY/MM/DD')
            let orderShipped= await db.get().collection(collection.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:"Shipped"}).toArray()
            let orderPlaced= await db.get().collection(collection.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:"placed"}).toArray()
            let orderPending= await db.get().collection(collection.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status: 'pending'}).toArray()
            let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({date:{$gte:start,$lte:end}}).toArray()
            let cancelOrder=await db.get().collection(collection.ORDER_COLLECTION).find({status:'Cancelled',date:{$gte:start,$lte:end}}).toArray()
            let allUser=await db.get().collection(collection.USER_COLLECTION).find({date:{$gte:start,$lte:end}}).toArray()
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({date:{$gte:start,$lte:end}}).toArray()
            let razorPay=await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"razorPay"}).toArray()
            let payPal=await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"payPal"}).toArray()
            let cod =await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"COD"}).toArray()
            let deliveredOrder=await db.get().collection(collection.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:'Delivered'}).toArray()
            let totalAmount=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
             {
                $match:{$and:[{status:{$ne:'Cancelled'}},{status:{$ne:'pending'}}]}                             
             },
              {
                $group:{
                  _id:null,
                  total:{$sum:"$totalAmount"}
                }
              }
            ]).toArray()
            let payPalLength=payPal.length;
            let razorPayLength=razorPay.length;
            let codLength=cod.length;
            let allProducts=products.length;
            let totalUsers=allUser.length;
            let orderShippedLength = orderShipped.length;
            let orderTotalLength = orderTotal.length;
            let orderFailLength = orderPending.length;
            let cancelTotal=cancelOrder.length
            let total=totalAmount[0]?.total;
            let placedTotal=orderPlaced.length;
            let orderDeliveredLength=deliveredOrder.length;

           
           
            





            var data = {
               start: start,
               end: end,
               totalOrders: orderTotalLength,
               shippedOrders: orderShippedLength,
               placedOrders:placedTotal,
               faildOrders: orderFailLength,
               totalSales: total,
               cod: codLength,
               paypal: payPalLength,
               razorpay:razorPayLength,
               
               cancelOrder:cancelTotal,
               allUser:totalUsers,
               totalProducts:allProducts,
               deliveredOrder:orderDeliveredLength
 
           }
       resolve(data)
       })
    },
         
    
    // report-search-by-date

    dateReport:(startDate,endDate)=>{
      return new Promise(async(resolve,reject)=>{
          
          
          let end= moment(endDate).format('YYYY/MM/DD')
          let start=moment(startDate).format('YYYY/MM/DD')

          
          let orderSuccess= await db.get().collection(collection.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:{ $ne: 'pending',$ne:'Cancelled' }}).toArray()
          let orderPending= await db.get().collection(collection.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status: 'pending'}).toArray()
          let orderTotal = await db.get().collection(collection.ORDER_COLLECTION).find({date:{$gte:start,$lte:end}}).toArray()
          let cancelOrder=await db.get().collection(collection.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:'Cancelled'}).toArray()
          let deliveredOrder=await db.get().collection(collection.ORDER_COLLECTION).find({date:{$gte:start,$lte:end},status:'Delivered'}).toArray()
          let allUser=await db.get().collection(collection.USER_COLLECTION).find({date:{$gte:start,$lte:end}}).toArray()
          let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({date:{$gte:start,$lte:end}}).toArray()
          let razorPay=await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"razorPay"}).toArray()
          let payPal=await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"payPal"}).toArray()
          let cod =await db.get().collection(collection.ORDER_COLLECTION).find({paymentMethod:"COD"}).toArray()
          let totalAmount=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
              {
                $group:{
                  _id:null,
                  total:{$sum:"$totalAmount"}
                }
              }
            ]).toArray()
            
           
            let payPalLength=payPal.length;
            let razorPayLength=razorPay.length;
            let codLength=cod.length;
          let allProducts=products.length;
          let totalUsers=allUser.length;
          let cancelTotal=cancelOrder.length
          let orderSuccessLength = orderSuccess.length
          let orderTotalLength = orderTotal.length
          let orderFailLength = orderPending.length;
          let total=totalAmount[0]?.total
          let orderDeliveredLength=deliveredOrder.length;
         
          var data = {
             start: start,
             end: end,
             totalOrders: orderTotalLength,
             successOrders: orderSuccessLength,
             faildOrders: orderFailLength,
             totalSales:total,
             cod: codLength,
             paypal: payPalLength,
             razorpay: razorPayLength,
             currentOrders: orderSuccess,
             cancelOrder:cancelTotal,
             allUser:totalUsers,
             totalProducts:allProducts,
             deliveredOrder:orderDeliveredLength
         }
     resolve(data)
    
     })

   },
  //  add-proOffers
  addProductOffer:(data) => {
    // let end= moment(endDate).format('YYYY/MM/DD')
    return new Promise(async(resolve,reject)=>{
      data.endDate=moment(data.endDate).format('YYYY/MM/DD')
      data.startDate=moment(data.startDate).format('YYYY/MM/DD')
      
      
       let response={}
       let exist= await db.get().collection(collection.PRODUCT_COLLECTION).findOne({Description:data.product,offer: { $exists: true }});
       if(exist){
           response.exist=true
           resolve(response)
       }else{
        db.get().collection(collection.PRODUCT_OFFERS).insertOne(data).then( (response) => {
            resolve(response)
        }).catch((err)=>{
            reject(err)
        })
       }
    })

},
getAllProOffers:()=>{
  return new Promise(async(resolve,reject)=>{
   let proOffers=await db.get().collection(collection.PRODUCT_OFFERS).find().sort({$natural:-1}).toArray()
   resolve(proOffers)
  })
},
startProductOffer:(todayDate)=>{
  let proStartDate =  moment(todayDate).format('YYYY/MM/DD')
  
  return new Promise(async(resolve,reject)=>{
      let data= await db.get().collection(collection.PRODUCT_OFFERS).find({startDate:{$lte:proStartDate}}).toArray();
      if(data){
          await data.map(async(onedata)=>{
              let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({Description:onedata.product, offer: { $exists: false }})
              if(product){
               
                  let actualPrice =product.Price
                  let newP =(((product.Price) * (onedata.offerPer))/100)
                  let newPrice =actualPrice-newP;

                  newPrice=newPrice.toFixed()
                 
                 
                  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(product._id)},{
                      $set:{
                          actualPrice: actualPrice,
                          Price:newPrice,
                          offer:true,
                          offerPer:onedata.offerPer
                      }
                  })
                  resolve()
              }else{
                  resolve()
              }

          })

      }else{
          resolve()
      }
  })
},
deleteProOffer:(Id)=>{
  return new Promise(async(resolve,reject)=>{
  let proOffer=await db.get().collection(collection.PRODUCT_OFFERS).findOne({_id:objectId(Id)})
  let proName=proOffer.product
 
  let Product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({Description:proName})
  
  db.get().collection(collection.PRODUCT_OFFERS).deleteOne({_id:objectId(Id)})
  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({Description:proName},
    {
      $set:{
        Price:Product?.actualPrice
      },
      $unset:{
        actualPrice:"",
        offer:"",
        offerPer:""
      }
    }).then((resopnse)=>{
      resolve(response)
    }).catch((err)=>{
      reject(err)
    })
  })
},
// category-offer
addCategoryOffer:(data)=>{
  
  data.endDate=moment(data.endDate).format('YYYY/MM/DD')
  data.startDate=moment(data.startDate).format('YYYY/MM/DD')
  return new Promise(async(resolve,reject)=>{
    let exist=await db.get().collection(collection.CATEGORY_OFFERS).findOne({category:data.category})
    
    if(exist){
      resolve()
    }else{

      db.get().collection(collection.CATEGORY_OFFERS).insertOne(data).then((response)=>{
        resolve(response)
      })
    }
  })
},
getAllCatOffers:()=>{
  return new Promise(async(resolve,reject)=>{
    let catOffers=await db.get().collection(collection.CATEGORY_OFFERS).find().sort({$natural:-1}).toArray()
    resolve(catOffers)
  })
},
startCategoryOffer:(date)=>{
  let catStartDate = moment(date).format('YYYY/MM/DD')
  
  return new Promise(async(resolve,reject)=>{
      let data= await db.get().collection(collection.CATEGORY_OFFERS).find({startDate:{$lte:catStartDate}}).toArray();
      if (data.length > 0) {
          await data.map(async (onedata) => {

              let products = await db.get().collection(collection.PRODUCT_COLLECTION).find({ CatagoryName: onedata.category, offer: { $exists: false } }).toArray();

              await products.map(async (product) => {
                  let actualPrice = product.Price
                  let newPrice = (((product.Price) * (onedata.offerPer)) / 100)
                  newPrice = newPrice.toFixed()
                  
                  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({ _id: objectId(product._id) },
                      {
                          $set: {
                            actualPrice: actualPrice,
                              Price: (actualPrice - newPrice),
                              offer: true,
                              offerPer: onedata.offerPer 
                          }
                      })
              })
          })
          resolve();
      }else{
          resolve()
      }

  })

},
deleteCategoryOffer:(Id)=>{
  return new Promise(async(resolve,reject)=>{
      let categoryOffer= await db.get().collection(collection.CATEGORY_OFFERS).findOne({_id:objectId(Id)})
      let catName=categoryOffer.category
      let product=await db.get().collection(collection.PRODUCT_COLLECTION).find({CatagoryName:catName},{offer:{$exists:true}}).toArray()
      if(product){
          db.get().collection(collection.CATEGORY_OFFERS).deleteOne({_id:objectId(Id)}).then(async()=>{
              await product.map((product)=>{

                  db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(product._id)},{
                      $set:{
                          Price: product?.actualPrice
                      },
                      $unset:{
                          offer:"",
                          offerPer:'',
                          actualPrice:''
                      }
                  }).then(()=>{
                      resolve()
                  })
              })
          })
      }else{
          resolve()
      }

  })

},
addBanner:(data)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.BANNER_COLLECTION).insertOne(data).then((response)=>{
      resolve(response.insertedId)
    })
  })
},
getAllBanners:()=>{
  return new Promise(async(resolve,reject)=>{
    let banners=await db.get().collection(collection.BANNER_COLLECTION).find().toArray()
    resolve(banners)
  })
},
deleteBanner:(Id)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.BANNER_COLLECTION).deleteOne({_id:objectId(Id)}).then((response)=>{
      resolve(response)
    })
  })
},
addCoupon:(data)=>{ 
  return new Promise(async(resolve,reject)=>{
     let startDate=moment(data.startDate).format('YYYY-MM-DD')
     let endDate= moment(data.endDate).format('YYYY-MM-DD')
    
      let dataobj = {
         couponCode: data.couponCode,
         offerPer: parseInt(data.offerPer),
         startDate: startDate,
         endDate: endDate,
         Users: []
     }
     db.get().collection(collection.COUPON_COLLECTION).insertOne(dataobj).then(()=>{
         resolve()
     }).catch((err)=>{
         resolve(err)
     })

  })
},
getAllCoupons:()=>{
  return new Promise(async(resolve,reject)=>{
    let coupons=await db.get().collection(collection.COUPON_COLLECTION).find().sort({$natural:-1}).toArray()
    resolve(coupons)
  })
},
deleteCoupon:(Id)=>{
  return new Promise((resolve,reject)=>{
    db.get().collection(collection.COUPON_COLLECTION).deleteOne({_id:objectId(Id)}).then((response)=>{
      resolve(response)
    })
  })
},
startCouponOffers:(date)=>{
  let couponStartDate = moment(date).format('YYYY-MM-DD')
 return new Promise(async(resolve,reject)=>{
     let data= await db.get().collection(collection.COUPON_COLLECTION).find({$and:[{startDate:{$lte:couponStartDate}},{endDate:{$gte:couponStartDate}}]}).toArray()
     
     if(data.length >0){
         await data.map((onedata)=>{
             db.get().collection(collection.COUPON_COLLECTION).updateOne({_id:objectId(onedata._id)},{
               $set:{
                 available: true
               }
             }).then(()=>{
                 resolve()
             })
         })
     }else{
         resolve()
     }
 })


},

          
}