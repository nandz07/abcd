var db=require('../config/connection')
var collection=require('../config/collections')
const collections = require('../config/collections')
var objectId=require('mongodb').ObjectID

module.exports={

    addProduct:(product,callback)=>{
        
        console.log("Product.Price")
        console.log(product.Price)
        product.Price=parseInt(product.Price)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
            callback(data.ops[0]._id)
        })

    },
    getAllProducts:(vid)=>{
        console.log("vid")
        console.log(vid)
        console.log("Db:vid")
        
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find({Vendor_id:vid}).toArray()
            resolve(products)
        })
    },
    doVendorLogin: (vendorData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let vendor = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ Vendor: vendorData.Vendor })
            if (vendor) {
                
                let Password = await db.get().collection(collection.VENDOR_COLLECTION).findOne({ Password: vendorData.Password }).then((status) => {
                    if (status) {
                        console.log("login success")
                        response.vendor = vendor
                        response.status = true
                        resolve(response)
                    } else {
                        console.log("login failed")
                        resolve({ status: false })
                    }
                })
            } else {
                console.log("login failed")
                resolve({ status: false })
            }
        })
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        proDetails.Price=parseInt(proDetails.Price)
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION)
            .updateOne({_id:objectId(proId)},{
                $set:{
                    Category:proDetails.Category,
                    Product:proDetails.Product,
                    Price:proDetails.Price
                    
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    getUserOrders:(venId)=>{
        return new Promise(async(resolve,reject)=>{
            
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find({vendor:objectId(venId)}).toArray()
            
            console.log(orders)
            resolve(orders)
        })
    },
    
    
    
}