var express = require('express');
var router = express.Router();
var vendorHelper = require('../helpers/vendor-helpers')
var adminHelper = require('../helpers/admin-helpers')

const verifyLogin=(req,res,next)=>{
  
  if(req.session.vendorLoggedIn){
    
    next()
  }else{
    res.redirect('/vendor/vendor-login')
  }

}

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.redirect('/vendor/vendor-login')
});

router.get('/vendor-home',verifyLogin, (req, res) => {
  let vendorSession = req.session.vendor
  
  res.render('vendor/vendor-home', { vendor: true,vendorSession });
})
router.get('/product-management',verifyLogin, (req, res) => {
  let vendorSession = req.session.vendor
  console.log("vendorSession1")
   console.log(vendorSession._id)
  let vid=vendorSession._id
  vendorHelper.getAllProducts(vid).then((product) => {
    console.log(product)
    console.log("vendorSession2")
    console.log(vendorSession._id)
    res.render('vendor/product-management', { vendor: true, product ,vendorSession});
  })

})
router.get('/order-management',verifyLogin, (req, res) => {
  let vendorSession = req.session.vendor
  vendorHelper.getUserOrders().then((orders)=>{
    res.render('vendor/order-management', { vendor: true ,vendorSession,orders});
})
  
})
router.get('/order-history',verifyLogin, (req, res) => {
  let vendorSession = req.session.vendor
  vendorHelper.getUserOrders(req.session.vendor._id).then((orders)=>{
    res.render('vendor/order-history', { vendor: true ,vendorSession,orders});
})
  
})
router.get('/add-product',verifyLogin, (req, res) => {
  let vendorSession = req.session.vendor
  let category=adminHelper.getAllCategory().then((category)=>{
    console.log(category)
    res.render('vendor/add-product',{vendorSession,category})
  })
  
})
router.post('/add-product',verifyLogin, (req, res) => {
  
  console.log(req.files.Image)
  

  vendorHelper.addProduct(req.body, (id) => {
    let image = req.files.Image
    image.mv('./public/product-images/' + id + '.jpg', (err, done) => {
      if (!err) {
        res.render('vendor/add-product')
      } else {
        console.log(err)
      }
    })

  })
})
router.get('/vendor-login', (req, res) => {
  if(req.session.vendorLoggedIn){
    res.redirect('/vendor/vendor-home')
  }else{
    res.render('vendor/vendor-login')
  }
  
})

router.post('/vendor-login', (req, res) => {
  vendorHelper.doVendorLogin(req.body).then((response) => {
    if (response.status) {
      
      req.session.vendor = response.vendor
      req.session.vendorLoggedIn = true
      res.redirect('/vendor/vendor-home')
    } else {
      req.session.vendorLoginErr="Inavalid username or password !"
      res.redirect('/vendor/vendor-login')
    }
  })

})
router.get('/vendor-logout', (req, res) => {
  req.session.vendor=null
  req.session.vendorLoggedIn=false
  console.log('logout successful')
  res.redirect('/vendor/vendor-login')
})
router.get('/delete-product/:id',(req,res)=>{
  let proId=req.params.id
  vendorHelper.deleteProduct(proId).then((response)=>{
      res.redirect('/vendor/product-management')
  }) 
})
router.get('/edit-product/:id',async (req,res)=>{
    let product=await vendorHelper.getProductDetails(req.params.id)
    console.log("hi")
    console.log(product)
    res.render('vendor/edit-product',{product})
})
router.post('/edit-product/:id',(req,res)=>{
    console.log(req.params.id)
    vendorHelper.updateProduct(req.params.id,req.body).then(()=>{
        
        if(req.files.Image){
            let id=req.params.id
            let image=req.files.Image
            image.mv('./public/product-images/' + id + '.jpg')
        }
        res.redirect('/vendor/product-management')
    })
    
}) 
module.exports = router;
