var db = require('../config/connection')
var collection = require('../config/collections');
const async = require('hbs/lib/async');
const moment = require('moment');
const { response, disable } = require('../app');
const { reject, promise } = require('bcrypt/promises');
const { ObjectId } = require('mongodb');
var objectId = require('mongodb').ObjectId
module.exports = {

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
                              let catagorys=await db.get()?.collection(collection.CATAGORY_COLLECTION).find().toArray()
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
       db.get()
      .collection(collection.PRODUCT_COLLECTION)
      .insertOne({
        Title: product.Title,
        Price: product.Price,
        Catagory: objectId(product.Catagory),
        Description: product.Description,
        CatagoryName: catName.Catagory,
        date: moment(new Date()).format('YYYY/MM/DD')
      })
      .then((data) => {
        callback(data.insertedId);
      });
  })
})
          },
  // get-all-products
  getAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
      resolve(products)
    })
  },
  getAllProduct: () => {
    return new Promise(async (resolve, reject) => {
      let products = await db.get()?.collection(collection.PRODUCT_COLLECTION).find().sort({ $natural: -1 }).toArray()
      resolve(products)
    })
  },
  // add-category
  addCatagory: (product) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.CATAGORY_COLLECTION).insertOne(product)
      resolve(true)
    })
  },
  // get-all-categorys
  getAllCatagorys: () => {
    return new Promise(async (resolve, reject) => {
      let catagorys = await db.get()?.collection(collection.CATAGORY_COLLECTION).find().toArray()
      resolve(catagorys)
    })
  },
  // delete-product
  deleteProduct: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).deleteOne({ _id: objectId(prodId) }).then((response) => {

        resolve(response.Name)
      })
    })
  },
  // get-one-product-details
  getProductDetails: (prodId) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION).findOne({ _id: objectId(prodId) }).then((product) => {

        resolve(product)
      })
    })
  },
  // edit-product
  updateProduct: (catName, proId, proDetails) => {
    return new Promise((resolve, reject) => {
      db.get().collection(collection.PRODUCT_COLLECTION)
        .update({ _id: objectId(proId) }, {
          $set: {
            Title: proDetails.Title,
            Price: proDetails.Price,
            Catagory: objectId(proDetails.Catagory),
            Description: proDetails.Description,
            CatagoryName: catName.Catagory,
            date: moment(new Date()).format('YYYY/MM/DD')

          }        
})
    })
  }
}
  
