var express = require("express");
const { redirect, status } = require("express/lib/response");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
var adminHelpers = require("../helpers/admin-helpers");
const async = require("hbs/lib/async");
const UserHelpers = require("../helpers/User-helpers");
const req = require("express/lib/request");
const { response } = require("../app");
const { findCatagory } = require("../helpers/admin-helpers");
const moment = require('moment');

/* GET users listing. */
// commen-session-checking
const verifyLogin = (req, res, next) => {
  if (req.session.adminloggedIn) {
    next();
  } else {
    let invalid= req.session.invalidadmin
   
    res.render("admin/admin-login",{ unknown: true,invalid });
    req.session.invalidadmin=false
  }
};
// dashboard
router.get('/dashboard',verifyLogin,async(req,res)=>{
  adminHelpers.monthlyReport().then((data)=>{
    

    res.render("admin/dashboard",{admin:true,data});
  })

   
     
})

router.get("/", function (req, res, next) {
  
   res.redirect('/admin/dashboard')

});

// admin-login
router.get("/login", verifyLogin, (req, res) => {
  res.redirect('/admin/dashboard')
});

router.post("/login", (req, res) => {
  adminHelpers.adminLogin(req.body).then((response) => {
      if (response.status) {
        req.session.adminloggedIn = true;
        req.session.admin = response.admin;
        res.redirect('/admin')
      } else {
        req.session.invalidadmin='Invalid UserName or Password'
        res.redirect("/admin");
        req.session.adminloggedIn = false;
      }
    
  });
});
// admin-logout
router.get("/logout", (req, res) => {                                                             
  req.session.adminloggedIn=false;
  res.redirect("/admin");
});
// product-managment
router.get("/product-view", verifyLogin, (req, res) => {
  productHelpers.getAllProduct().then((products) => {
   
      res.render("admin/view-products", { admin: true, products });
  });
});
// add-product
router.get("/product-add", verifyLogin, (req, res) => {
  productHelpers.getAllCatagorys().then((catagorys) => {
    res.render("admin/add-products", { admin: true, catagorys });
  });
});
router.post("/product-add", verifyLogin, (req, res) => {
  
  productHelpers.findCatagoryName(req.body.Catagory).then((data)=>{
    productHelpers.addProduct(data,req.body, (id) => {
      // image-1
      if (req.files?.image1) {
        let image = req.files.image1;
        image.mv("./public/product-images/" + id + ".jpg")
      }
      // image-2
      if (req.files?.image2) {
        let image2 = req.files.image2;
        image2.mv("./public/product-images/" + id + "a.jpg")
      }
      // image-3
      if (req.files?.image3) {
        let image3 = req.files.image3;
        image3.mv("./public/product-images/" + id + "b.jpg")
      }
      // image-4
      if (req.files?.image4) {
        let image4 = req.files.image4;
        image4.mv("./public/product-images/" + id + "c.jpg")
      }
      res.redirect("/admin/product-view");
    });


  })
  
});
// delete-product
router.get("/delete-product", verifyLogin, (req, res) => {
  let proId = req.query.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/product-view");
  });
});
// edit-product
router.get("/edit-product", verifyLogin, (req, res) => {
  productHelpers.getAllCatagorys().then(async (catagorys) => {
    let product = await productHelpers.getProductDetails(req.query.id);
    
    res.render("admin/edit-product", { admin: true, catagorys, product });
  });
});

router.post("/product-edit/:id", verifyLogin, (req, res) => {
  productHelpers.findCatagoryName(req.body.Catagory).then((catName)=>{

    productHelpers.updateProduct(catName,req.params.id, req.body).then(() => {
      let id=req.params.id
      // image-1
      if (req.files?.image1) {
        let image = req.files.image1;
        image.mv("./public/product-images/" + id + ".jpg")
      }
      // image-2
      if (req.files?.image2) { 
        let image2 = req.files.image2;
        image2.mv("./public/product-images/" + id + "a.jpg")
      }
      // image-3
      if (req.files?.image3) {
        let image3 = req.files.image3;
        image3.mv("./public/product-images/" + id + "b.jpg")
      }
      // image-4
      if (req.files?.image4) {
        let image4 = req.files.image4;
        image4.mv("./public/product-images/" + id + "c.jpg")
      }
      res.redirect("/admin/product-view");
    });
  })
});
// category-managment
router.get("/catagory-view", verifyLogin, (req, res) => {
  productHelpers.getAllCatagorys().then((catagorys) => {
    res.render("admin/view-catagory", { admin: true, catagorys });
  });
});
// add-category
router.get("/catagory-add", verifyLogin, (req, res) => {
  res.render("admin/add-catagory", { admin: true });
});

router.post("/catagory-add", verifyLogin, (req, res) => {
  productHelpers. addCatagory(req.body);
  res.redirect("/admin/catagory-view");
});
// delete-catagory
router.get("/delete-catagory", verifyLogin, (req, res) => {
  let proId = req.query.id;
  productHelpers.deleteCatagory(proId).then((response) => {
    res.redirect("/admin/catagory-view");
  });
});
// edit-catagory
router.get('/edit-catagory',verifyLogin,(req,res)=>{
  let id=req.query.id
adminHelpers.findCatagory(id).then((data)=>{
  
  res.render('admin/edit-catagory',{data,admin:true})
})
})

router.post('/edit-catagory',(req,res)=>{
  let id=req.query.id
  cata=req.query.data
  adminHelpers.editCatagory(id,req.body).then((response)=>{
   
    adminHelpers.catagoryEdit(id,req.body).then((response)=>{
      res.redirect('/admin/catagory-view')
    })
  
  })
})



// user-manegment
router.get("/all-users", verifyLogin, (req, res) => {
  adminHelpers.getAllUsers().then((Users) => {
    res.render("admin/all-users", { admin: true, Users });
  });
});
router.get("/user-add", verifyLogin, (req, res) => {
  let EmlMobErr= req.session.EmlMobErr
  

  res.render("admin/add-user", { admin: true,EmlMobErr });
  req.session.EmlMobErr=false
  
});
// add-user
router.post("/user-add", verifyLogin, (req, res) => {
  UserHelpers.findExist(req.body.Email).then((status)=>{
    if(status){
      
      req.session.EmlMobErr='Email or Mobile Number Alredy Exists'
      res.redirect('/admin/user-add')
    }else{
      UserHelpers.doSignup(req.body).then((response) => {
       
        res.redirect("/admin/all-users");
      });
      
    }
  })
});
// block-unblock-user
router.get("/block-User", verifyLogin, (req, res) => {
  let id = req.query.id;
  let name=req.query.name
  if(name){
    UserHelpers.blockUser(id).then((data) => {
      res.redirect("/admin/all-users");
    });
  }else{
    UserHelpers.unBlockUser(id).then((data) => {
      res.redirect("/admin/all-users");
    });
  }
 
});
// order-manegment
 router.get('/orders',verifyLogin,(req,res)=>{
   adminHelpers.allOrders().then((orders)=>{
     res.render("admin/orders",{admin:true,orders})
   })
 })

// change-order-status
 router.get('/change-status',verifyLogin,(req,res)=>{
   let orderId=req.query.id;
   let newStatus=req.query.status
   let deliveryStatus=false;
   let cancelStatus=false;
   if(newStatus=="Delivered"){
      cancelStatus=false;
      deliveryStatus=true
   }
   if(newStatus=="Cancelled"){
    cancelStatus=true;
   }
   adminHelpers.updateStatus(orderId,newStatus,cancelStatus,deliveryStatus).then((response)=>{
    adminHelpers.allOrders().then((orders)=>{
      res.render("admin/orders",{admin:true,orders})
    })
   })
 })

//  dashboard-report-by-date
router.post('/date-report',(req,res)=>{
  let endDate=req.body.endDate;
  let startDate=req.body.startDate;

  adminHelpers.dateReport(startDate,endDate).then((data)=>{
    res.render('admin/report',{admin:true,data})
  })
})
// sort-report
router.get('/limit-report',verifyLogin,(req,res)=>{
  let today=new Date();
  let endDate= moment(today).format('YYYY/MM/DD')
  let startDate=moment(endDate).subtract(30,'days').format('YYYY/MM/DD')
  if(req.query.limit=='yearly'){
    
    startDate=moment(endDate).subtract(364,'days').format('YYYY/MM/DD')
  }else if(req.query.limit=='monthly'){
   
    startDate=moment(endDate).subtract(30,'days').format('YYYY/MM/DD')
  }else if(req.query.limit='weekly'){
    
    startDate=moment(endDate).subtract(7,'days').format('YYYY/MM/DD')
  }
  adminHelpers.dateReport(startDate,endDate).then((data)=>{
    res.render('admin/report',{admin:true,data})
  })
  

})
// sales-report
router.get('/report',verifyLogin,(req,res)=>{
  adminHelpers.monthlyReport().then((data)=>{
    adminHelpers.allOrders().then((orders)=>{

      res.render('admin/report',{admin:true,data,orders})
    })

  })
})
// product-offers

router.get('/proOffers-view', verifyLogin,(req,res)=>{
  adminHelpers.getAllProOffers().then((proOffers)=>{

    res.render('admin/view-proOffers',{admin:true,proOffers})
  })
})
// add-proOffer
router.get('/proOffers-add', verifyLogin,(req,res)=>{
  productHelpers.getAllProduct().then((products)=>{

    res.render('admin/add-proOffer',{admin:true,products})
  })
})

router.post('/proOffers-add',(req,res)=>{
  adminHelpers.addProductOffer(req.body).then((response)=>{
    if(response.exist){
      req.session.proOfferExist = true
      res.redirect("/admin/proOffers-view") 
    }else{
    res.redirect("/admin/proOffers-view")    
    }
   })
})
// delete-proOffer
router.get('/delete-proOffer', verifyLogin,(req,res)=>{
  let id=req.query.id
  adminHelpers.deleteProOffer(id).then((response)=>{

    res.redirect("/admin/proOffers-view")  
  })
})
// category-offer
router.get('/catOffers-view', verifyLogin,(req,res)=>{
  
adminHelpers.getAllCatOffers().then((catOffers)=>{

  res.render('admin/view-catOffer',{admin:true,catOffers})
})
  
})

router.get('/catOffers-add', verifyLogin,(req,res)=>{
  productHelpers.getAllCatagorys().then((category)=>{

    res.render('admin/add-catOffer',{admin:true,category})
  })
})
// add-category-offer
router.post('/catOffers-add',(req,res)=>{
  adminHelpers.addCategoryOffer(req.body).then((response)=>{
    res.redirect('/admin/catOffers-view')
  })
})
// delete-category-offer
router.get('/delete-catOffer', verifyLogin,(req,res)=>{
  let Id=req.query.id
  adminHelpers.deleteCategoryOffer(Id).then((response)=>{
    res.redirect('/admin/catOffers-view')
  })
})
// Banner-managment
router.get('/banner-view', verifyLogin,(req,res)=>{
  adminHelpers.getAllBanners().then((banners)=>{

    res.render('admin/view-banner',{admin:true,banners})
  })
})

// add-banner
router.get('/banner-add', verifyLogin,(req,res)=>{
  productHelpers.getAllCatagorys().then((data)=>{

    res.render('admin/add-banner',{admin:true,data})
  })
  
 
  
})

router.post('/banner-add',(req,res)=>{
  adminHelpers.addBanner(req.body).then((Id)=>{
    if (req.files?.image) {
      let image = req.files.image;
      image.mv("./public/banner-images/" + Id + ".jpg")
    }
    res.redirect('/admin/banner-view')
  })
})
// delete-banner
router.get("/delete-banner", verifyLogin,(req,res)=>{
  let Id=req.query.id
  adminHelpers.deleteBanner(Id).then((resoponse)=>{
    res.redirect('/admin/banner-view')
  })
})
// coupon-manegment
router.get("/coupon-view", verifyLogin,(req,res)=>{
  adminHelpers.getAllCoupons().then((coupons)=>{

    res.render('admin/view-coupon',{admin:true,coupons})
  })
})
router.get('/coupon-add', verifyLogin,(req,res)=>{
  res.render('admin/add-coupon',{admin:true})
})
router.post('/coupon-add',(req,res)=>{
  adminHelpers.addCoupon(req.body).then((response)=>{
    res.redirect('/admin/coupon-view')
  })
})
// delete-coupon
router.get('/delete-coupon', verifyLogin,(req,res)=>{
  Id=req.query.id
  adminHelpers.deleteCoupon(Id).then((response)=>{
    res.redirect('/admin/coupon-view')
  })
})

module.exports = router;
