var express = require('express');
const { render } = require('../app');
const adminHelpers = require('../helpers/admin-helpers');
var router = express.Router();
var adminHelper = require('../helpers/admin-helpers')
const bcrypt = require('bcrypt')
const verifyLogin=(req,res,next)=>{
    if(req.session.adminLoggedIn){
      next()
    }else{
      res.redirect('/admin/admin-login')
    }
  
  }


/* GET users listing. */

router.get('/', function (req, res, next) {
    res.redirect('/admin/admin-login')
});
router.get('/admin-home',verifyLogin, (req, res) => {
    let adminSession = req.session.admin
    console.log(adminSession)
    res.render('admin/admin-home', { admin: true, adminSession });
})
router.get('/vendor-management',verifyLogin, (req, res) => {
    let adminSession = req.session.admin
    adminHelper.getAllVendors().then((vendors) => {
        
        console.log(vendors)
        res.render('admin/vendor-management', { admin: true, vendors, adminSession });
    })

})
router.get('/category-management',verifyLogin, (req, res) => {
    let adminSession = req.session.admin
    adminHelper.getAllCategory().then((category) => {
        console.log(category)
        res.render('admin/category-management', { admin: true, category , adminSession});
    })

})
router.get('/order-details',verifyLogin, (req, res) => {
    let adminSession = req.session.admin
    adminHelper.getUserOrders().then((orders)=>{
        res.render('admin/order-details', { admin: true, adminSession,orders });
    })
    
})
router.get('/user-details',verifyLogin, (req, res) => {
    let adminSession = req.session.admin
    adminHelper.getAllUsers().then((users) => {
    res.render('admin/user-details', { admin: true, adminSession ,users});
    })
})
router.get('/delete-user/:id',(req,res)=>{
    let usId=req.params.id
    
    adminHelper.deleteUser(usId).then((response)=>{
        res.redirect('/admin/user-details')
    })
    
    
})
router.get('/add-vendor',verifyLogin, (req, res) => {
    res.render('admin/add-vendor', { user: false })
})
router.post('/add-vendor',verifyLogin, (req, res) => {
    console.log(req.body)
    console.log(req.files.Image)

    adminHelper.addVendor(req.body, (id) => {
        let image = req.files.Image
        image.mv('./public/vendor-images/' + id + '.jpg', (err, done) => {
            if (!err) {
                res.render('admin/add-vendor',{  })
            } else {
                console.log(err)
            }
        })

    })
})
router.get('/add-category',verifyLogin, (req, res) => {
    res.render('admin/add-category')

})
router.post('/add-category',verifyLogin, (req, res) => {
    console.log(req.body)
    adminHelper.addCategory(req.body)
    res.render('admin/add-category')
})
router.get('/admin-login', (req, res) => {
    if(req.session.adminLoggedIn){
        res.redirect('/admin/admin-home')
    }else
    res.render('admin/admin-login')
})

router.post('/admin-login', (req, res) => {
    adminHelper.doAdminLogin(req.body).then((response) => {
        if (response.status) {
            req.session.adminLoggedIn = true
            req.session.admin = response.admin
            res.redirect('/admin/admin-home')
        } else {
            res.redirect('/admin/admin-login')
        }
    })

})
router.get('/admin-logout', (req, res) => {
    req.session.admin=null
    req.session.adminLoggedIn=false
    res.redirect('/admin/admin-login')
})
// router.get('/delete-vendor/',(req,res)=>{
//     let proId=req.query.id
//     console.log(proId)
//     console.log(req.query.name)
// })
router.get('/delete-vendor/:id',(req,res)=>{
    let venId=req.params.id
    
    adminHelper.deleteVendor(venId).then((response)=>{
        res.redirect('/admin/vendor-management')
    })
    
    
})
router.get('/delete-category/:id',(req,res)=>{
    let catgId=req.params.id
    adminHelper.deleteCategory(catgId).then((response)=>{
        res.redirect('/admin/category-management')
    })
    
    
})
router.get('/edit-vendor/:id',async (req,res)=>{
    let vendoR=await adminHelper.getVendorDetails(req.params.id)
    res.render('admin/edit-vendor',{vendoR})
})
router.post('/edit-vendor/:id',(req,res)=>{
    console.log(req.params.id)
    adminHelper.updateVendor(req.params.id,req.body).then(()=>{
        
        if(req.files.Image){
            let id=req.params.id
            let image=req.files.Image
            image.mv('./public/vendor-images/' + id + '.jpg')
        }
        res.redirect('/admin/vendor-management')
    })
    
})
router.get('/edit-category/:id',async (req,res)=>{
    let category=await adminHelper.getCategoryDetails(req.params.id)
    res.render('admin/edit-category',{category})
})
router.post('/edit-category/:id',(req,res)=>{
    adminHelper.updateCategory(req.params.id,req.body).then(()=>{
        res.redirect('/admin/category-management')
    })
    
})
router.post('/block-vendor',(req,res)=>{
    console.log("BB call")
    console.log("req.body"+req.body.status)
    console.log("req.body"+req.body.vendor)
    
    if(req.body.status=='Block'){
        adminHelper.blockVendor(req.body.vendor).then(()=>{
            // console.log("res"+response.status)
            res.json(status='Unblock')
        })
    }else{
        adminHelper.unBlockVendor(req.body.vendor).then(()=>{
            res.json(status='Block')
        }) 
    }
    // let vendoR=await adminHelper.getVendorDetails(req.body)
    
    
})

module.exports = router;
