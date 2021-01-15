var express = require('express');
var router = express.Router();
var adminHelper=require('../helpers/admin-helpers')
var vendorHelper=require('../helpers/vendor-helpers')
var userHelper=require('../helpers/user-helpers');
const { response } = require('express');
const { use } = require('../app');
const verifyLogin=(req,res,next)=>{
  
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect('/login')
  }

}

/* GET home page. */
router.get('/', async function(req, res, next) {
  let userSession=req.session.user
  console.log(userSession)
  let cartCount=null
  if(userSession){
   cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  userHelper.getAllVendorsUserSide().then((vendors)=>{
    // console.log(vendors)
    adminHelper.getAllCategory().then((category)=>{
    res.render('user/view-vendors',{user:true,vendors,userSession,cartCount,category});
  })
  }); 
})
router.get('/view-products/:id',async(req,res)=>{
  let userSession=req.session.user
  let vid=req.params.id
  adminHelper.getAllCategory().then((category)=>{
    console.log("hi-c")
  // console.log(category.ops[0])
  })
  
  let cartCount=null
  if(userSession){
     cartCount=await userHelper.getCartCount(req.session.user._id)
  }
  
  vendorHelper.getAllProducts(vid).then((products)=>{
    console.log(products)
    adminHelper.getAllCategory().then((category)=>{
    res.render('user/view-products',{user:true,products,userSession,vid,cartCount})
  })
  })
})
router.get('/login',(req,res)=>{
  if(req.session.user){
    res.redirect('/')
  }else
  res.render('user/login',{"loginErr":req.session.userLoginErr})
  req.session.userLoginErr=false
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelper.doSignup(req.body).then((response)=>{
    console.log(response)
    
    req.session.user=response
    req.session.userLoggedIn=true
    res.redirect('/')

  }) 
})
router.post('/login',(req,res)=>{
  userHelper.doUserLogin(req.body).then((response)=>{
    if (response.status){
      
      req.session.user=response.user
      req.session.userLoggedIn=true
      res.redirect('/')
    }else{
      req.session.userLoginErr="Inavalid username or password !"
      res.redirect('/login')
    }
  })

}) 
router.get('/logout',(req,res)=>{
  // delete req.session.user;
  req.session.user=null
  req.session.userLoggedIn=false
  res.redirect('/')
})
router.get('/cart',verifyLogin,async(req,res)=>{
  let userSession=req.session.user
  let products=await userHelper.getCartProducts(req.session.user._id)
  console.log("p1"+products)
  let totalValue= await userHelper.getTotalAmount(req.session.user._id)
  console.log("totalValue.length"+totalValue.length)
  if (totalValue.length>0){
    totalValue= await userHelper.getTotalAmount(req.session.user._id)
  } 
  console.log(products)
  console.log("total"+totalValue)
  
  res.render('user/cart',{userSession,products,totalValue})
})
router.get('/add-to-cart/',(req,res)=>{
  console.log("api call")

  let pId=req.query.pId
  let vId=req.query.vId
  console.log("req.user")
  console.log(req.user)
  userHelper.addToCart(req.session.user._id,pId,vId).then(()=>{
    //res.redirect('/view-products/'+vId)
    res.json({status:true})
  })
  
})
router.post('/change-product-quantity',(req,res,next)=>{
  console.log("req.body")
  console.log(req.body)
  userHelper.changeProductQuantity(req.body).then(async(response)=>{
    response.total=await userHelper.getTotalAmount(req.body.user)
    res.json(response)
  })
})
router.post('/remove-cart-item',(req,res,next)=>{
  console.log("hi")
  console.log(req.body)
  userHelper.removeCartItem(req.body).then((response)=>{
    res.json(response)
  })
})
router.get('/place-order',verifyLogin,async(req,res)=>{
  
  
  let total=await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order',{total,user:req.session.user})
})
router.post('/place-order',async(req,res)=>{
  let products=await userHelper.getCartProductList(req.body.userId)
  let totalPrice=await userHelper.getTotalAmount(req.body.userId)
  userHelper.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    if(req.body['payment-method']==='COD'){
      res.json({codSuccess:true})
    }else{
      userHelper.generateRazorpay(orderId,totalPrice).then((response)=>{
        res.json(response)
      })
    }
    

  })
  console.log(req.body)
})
router.get('/order-success',(req,res)=>{
  res.render('user/order-success',{user:req.session.user})
})
router.get('/orders',async(req,res)=>{
  console.log(req.session.user._id)
  let orders=await userHelper.getUserOrders(req.session.user._id)
  console.log("orders")
  console.log(orders)
  res.render('user/orders',{user:req.session.user,orders})
})
router.get('/view-order-products/:id',async(req,res)=>{
  console.log("req.params.id")
  console.log(req.params.id)
  let products=await userHelper.getOrderProducts(req.params.id)
  res.render('user/view-order-products',{user:req.session.user,products})
})
router.post('/verify-payment',(req,res)=>{
  console.log("req.body")
  console.log(req.body)
  userHelper.verifypayment(req.body).then(()=>{
    userHelper.changePaymentStatus(req.body['order[receipt]']).then(()=>{
      console.log("payment successfull")
      res.json({status:true})
    })
  }).catch((err)=>{
    console.log(err)
    res.json({status:false,errMsg:''})
  })
})
router.get('/product-details/:id',async(req,res)=>{
  console.log("pro"+req.params.id)
  let product=await userHelper.getProductDetails(req.params.id)
  res.render('user/product-details',{user:req.session.user,product})
})
router.get('/about',(req,res)=>{
  res.render('user/about')
})
router.get('/contact',(req,res)=>{
  res.render('user/contact')
})
module.exports = router;

