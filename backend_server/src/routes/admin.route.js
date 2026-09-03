const express = require('express')
const { aprouveAppointment } = require('../controller/admin.js')


const adminRoute = express.Router() 

adminRoute.patch('/approve-appointment', aprouveAppointment)

module.exports = adminRoute