import express from "express"

import isauth from "../Middlewares/auth.js"

import { getMessage, sendMessage } from "../Controllers/Meassage.control.js"
const  messageRoutes= express.Router()
    
messageRoutes.post('/send/:id',isauth,sendMessage)
messageRoutes.get('/all/:id',isauth,getMessage)


export default messageRoutes;

