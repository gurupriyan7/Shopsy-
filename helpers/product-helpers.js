var db=require('../config/connection')
var collection=require('../config/collections');
const async = require('hbs/lib/async');
const moment = require('moment');
const { response, disable } = require('../app');
const { reject, promise } = require('bcrypt/promises');
const { ObjectId } = require('mongodb');
var objectId=require('mongodb').ObjectId
module.exports={

  // add-product
           addProduct: (catName,product, callback)=>{
                   
                    db.get()
                      .collection(collection.PRODUCT_COLLECTION)
                      .insertOne({
                        Title:product.Title,
                        Price:product.Price,
                        Catagory:objectId(product.Catagory),
                        Description:product.Description,
                        CatagoryName:catName.Catagory,
                        date:moment(new Date()).format('YYYY/MM/DD')
                      })
                      .then((data)=>{
                        callback(data.insertedId);
                      });
                  },
                  // get-all-products
          getAllProducts:()=>{
                    return new Promise(async(resolve,reject)=>{
                              let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
                              resolve(products)
                    })
          } , 
          getAllProduct:()=>{
                    return new Promise(async(resolve,reject)=>{
                              let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().sort({$natural:-1}).toArray()
                              resolve(products)
                    })
          } , 
          // add-category
          addCatagory:(product)=>{
                   return new Promise((resolve,reject)=>{
                              db.get().collection(collection.CATAGORY_COLLECTION).insertOne(product)
                              resolve(true)
                    }) 
          } ,
          // get-all-categorys
          getAllCatagorys:()=>{
                    return new Promise(async(resolve,reject)=>{
                              let catagorys=await db.get().collection(collection.CATAGORY_COLLECTION).find().toArray()
                              resolve(catagorys)
                    })
          },
          // delete-product
          deleteProduct:(prodId)=>{
            return new Promise((resolve,reject)=>{
              db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({_id:objectId(prodId)}).then((response)=>{
                
                resolve(response.Name)
              })
            })
          },
          // get-one-product-details
          getProductDetails:(prodId)=>{
            return new Promise((resolve,reject)=>{
             db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(prodId)}).then((product)=>{

               resolve(product)
             })
            })
          },
          // edit-product
          updateProduct:(catName,proId,proDetails)=>{
            return new Promise((resolve,reject)=>{
              db.get().collection(collection.PRODUCT_COLLECTION)
              .update({_id:objectId(proId)},{
                $set:{
                  Title:proDetails.Title,
                  Price:proDetails.Price,
                  Catagory:objectId(proDetails.Catagory),
                  Description:proDetails.Description,
                  CatagoryName:catName.Catagory,
                  date:moment(new Date()).format('YYYY/MM/DD')
                  
                }
              }).then((response)=>{
                resolve(response)
              })
            })
          },
          // delete-category
          deleteCatagory:(proId)=>{
            return new Promise((resolve,reject)=>{
              db.get().collection(collection.CATAGORY_COLLECTION).deleteOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
                
              })
            })
          },
          // find-product
          findProduct:(proId)=>{
            return new Promise(async(resolve,reject)=>{
             let product=await db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)})
             resolve(product)
            
            })
          },
          // find-category
          findCatagoryName:(catId)=>{
            return new Promise((resolve,reject)=>{
              db.get().collection(collection.CATAGORY_COLLECTION).findOne({_id:objectId(catId)}).then((response)=>{
                resolve(response)
                
              })
            })
          },
          // get-ordered-products
          findOrderProducts:(ordrId)=>{
            return new Promise(async(resolve,reject)=>{
              let orderProducts=await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                  $match:{
                    _id:objectId(ordrId)
                  }
                },
                {
                  $unwind:"$products"
                },
                {
                  $project:{
                    item:"$products.item",
                    quantity:"$products.quantity"
                  }
                },
                {
                  $lookup:{
                    from:collection.PRODUCT_COLLECTION,
                    localField:'item',
                    foreignField:'_id',
                    as:'products'
                  }
                },
                {
                   $project:{
                     item:1,quantity:1,products:{$arrayElemAt:['$products',0]}
                   }
                }
              ]).toArray()
              
              resolve(orderProducts)
            })
          },
          // update-wishlist
          wishUpdate:(userId,prodId)=>{

            return new Promise(async(resolve,reject)=>{
              let proObj={
                userId:objectId(userId)
              }
             let product=await db.get().collection(collection.PRODUCT_COLLECTION).find({_id:objectId(prodId)}).toArray()
                
             if(product[0].wishUser){
               
               db.get().collection(collection.PRODUCT_COLLECTION)
               .updateOne({_id:objectId(prodId)},
               {
                 $push:{wishUser:proObj}
               }).then((response)=>{
                 resolve(response)
               })
             }else{
               
               db.get().collection(collection.PRODUCT_COLLECTION)
               .updateOne({_id:objectId(prodId)},
               {
                 $set:{
                   wishUser:[proObj]
                 }
               }).then((response)=>{
                 resolve(response)
               })
             }
            })
          },
          
          wishExist:(userId)=>{
            return new Promise(async(resolve,reject)=>{
           db.get().collection(collection.PRODUCT_COLLECTION)
           .updateMany({'wishUser.userId':objectId(userId)},
           {
             $set:{
               wishList:true
             }
           }).then((response)=>{
             resolve(response)
           })
           db.get().collection(collection.PRODUCT_COLLECTION)
           .updateMany({'wishUser.userId':{$ne:objectId(userId)}},
           {
             $set:{
               wishList:false
             }
           }).then((response)=>{

             resolve(response)
           })
           


            })
          },
          wishTrue:(userId,prodId)=>{
            return new Promise((resolve,reject)=>{
              db.get().collection(collection.PRODUCT_COLLECTION)
              .updateOne({'wishUser.userId':objectId(userId)},
              {
                $set:{
                  wishList:true
                }
              }).then((response)=>{
                resolve(response)
              })
            })
          },
          wishClean:(userId)=>{
            return new Promise((resolve,reject)=>{
             db.get().collection(collection.PRODUCT_COLLECTION)
             .updateMany({},
              {
                $set:{
                  wishList:false
                }
             }).then((response)=>{
               resolve(response)
             })
            })
          },
          removeWish:(userId,proId)=>{
            return new Promise((resolve,reject)=>{
              db.get().collection(collection.PRODUCT_COLLECTION)
              .updateOne({'wishUser.userId':objectId(userId)},
              {
                $set:{
                  wishList:false
                }
              }).then((response)=>{
                resolve(response)
              })
              db.get().collection(collection.PRODUCT_COLLECTION)
              .updateOne({_id:objectId(proId)},
              {
                $pull:{wishUser:{userId:objectId(userId)}}
              }).then((response)=>{
                resolve(response)
              })
            })
          }
          
          
}