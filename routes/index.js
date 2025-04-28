const express=require('express')
const auth=require('../routes/authRoutes.js')
const habit=require('../routes/habitRoutes.js')


const router=express.Router()
router.use("/auth",auth)
router.use('/habit',habit)


module.exports=router;