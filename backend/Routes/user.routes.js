import express from "express"
import { getprofile, login, logout, register,editprofile, getsuggesteduser, followorunfollow, searchUsers, explorePosts } from "../Controllers/user.control.js"
import isauth from "../Middlewares/auth.js"
import upload from "../Middlewares/multer.js"
const  userRoutes= express.Router()


userRoutes.post('/register',register)
userRoutes.post('/login',login)
userRoutes.get('/logout',logout)
userRoutes.get('/:id/profile',isauth,getprofile,)
userRoutes.post('/profile/edit',isauth,upload.single("profilePicture"),editprofile)
userRoutes.get('/suggested',isauth,getsuggesteduser)
userRoutes.get('/followorunfollow/:id',isauth,followorunfollow)
userRoutes.get('/search',isauth,searchUsers)
userRoutes.get('/explore',isauth,explorePosts)


export default userRoutes;

