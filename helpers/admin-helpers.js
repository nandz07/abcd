var db = require('../config/connection')
var collection = require('../config/collections')
const collections = require('../config/collections')
const { response } = require('express')
var objectId=require('mongodb').ObjectID
module.exports = {

    addVendor: (vendor, callback) => {
        console.log(vendor)
        db.get().collection('vendor').insertOne(vendor).then((data) => {
            callback(data.ops[0]._id)
        })

    },
    addCategory: (category) => {
        console.log(category)
        db.get().collection('category').insertOne(category).then((data) => {
            //callback(data.ops[0]._id)
        })

    },
    getAllVendors: () => {
        return new Promise(async (resolve, reject) => {
            let vendors = await db.get().collection(collection.VENDOR_COLLECTION).find().toArray()
            resolve(vendors)
        })
    },
    getAllCategory: () => {
        return new Promise(async (resolve, reject) => {
            let category = await db.get().collection(collection.CATEGORY_COLLECTION).find().toArray()
            resolve(category)
        })
    },
    getAllUsers: () => {
        return new Promise(async (resolve, reject) => {
            let users = await db.get().collection(collection.USER_COLLECTION).find().toArray()
            resolve(users)
        })
    },
    doAdminLogin: (adminData) => {
        return new Promise(async (resolve, reject) => {
            let loginStatus = false
            let response = {}
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Admin: adminData.Admin })
            if (admin) {
                //bcrypt.compare(adminData.Password,admin.Password).then((status)=>{
                let Password = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Password: adminData.Password }).then((status) => {
                    if (status) {
                        console.log("login success")
                        response.admin = admin
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
    deleteVendor:(venId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.VENDOR_COLLECTION).removeOne({_id:objectId(venId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    deleteCategory:(catgId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).removeOne({_id:objectId(catgId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    deleteUser:(usId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).removeOne({_id:objectId(usId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    getVendorDetails:(venId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.VENDOR_COLLECTION).findOne({_id:objectId(venId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    updateVendor:(venId,venDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.VENDOR_COLLECTION)
            .updateOne({_id:objectId(venId)},{
                $set:{
                    Vendor:venDetails.Vendor,
                    Shop:venDetails.Shop,
                    Password:venDetails.Password
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    getCategoryDetails:(catgId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION).findOne({_id:objectId(catgId)}).then((response)=>{
                console.log(response)
                resolve(response)
            })
        })
    },
    updateCategory:(catgId,catgDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.CATEGORY_COLLECTION)
            .updateOne({_id:objectId(catgId)},{
                $set:{
                    Category:catgDetails.Category
                }
            }).then((response)=>{
                resolve(response)
            })
        })
    },
    getUserOrders:()=>{
        return new Promise(async(resolve,reject)=>{
            
            let orders=await db.get().collection(collection.ORDER_COLLECTION).find().toArray()
            
            console.log(orders)
            resolve(orders)
        })
    },
    blockVendor:(vendId)=>{
        console.log("helper call")
        
        return new Promise((resolve,reject)=>{
             db.get().collection(collection.VENDOR_COLLECTION)
            .updateOne({_id:objectId(vendId)},{
                $set:{
                    status:'Unblock'
                }
            }).then((response)=>{
                // console.log("response helper")
                // console.log("resp"+response)
                resolve(response)

            })
        })
    },
    unBlockVendor:(vendId)=>{
        
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.VENDOR_COLLECTION)
            .updateOne({_id:objectId(vendId)},{
                $set:{
                    status:'Block'
                }
            }).then((response)=>{
                resolve(response)

            })
        })
    },
    bblockVendor:(vendId)=>{
        console.log("bb helper call")
        
        return new Promise(async(resolve,reject)=>{
            let status=await db.get().collection(collection.VENDOR_COLLECTION)
            .updateOne({_id:objectId(vendId)},{
                $set:{
                    status:'Unblock'
                }
            }).toArray()
            console.log("status bb")
            
            console.log(status)
            console.log("status bb2")
            console.log(status[0].status)

        })
    },
}