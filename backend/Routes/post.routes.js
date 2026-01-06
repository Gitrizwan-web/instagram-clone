import express from "express"
import isauth from "../Middlewares/auth.js"
import upload from "../Middlewares/multer.js"
import { addComment, addNewPost, bookmarkPost, deletePost, dislikePost, getAllPost, getCommentsOfPost, getUserPost, likePost } from "../Controllers/post.control.js"
const  postroutes= express.Router()
postroutes.post("/addpost",isauth,upload.single('image'),addNewPost)
postroutes.get("/all",isauth,getAllPost)
postroutes.get("/userpost/all",isauth,getUserPost)
postroutes.get("/:id/like",isauth,likePost)
postroutes.get("/:id/dislike",isauth,dislikePost)
postroutes.post("/:id/comment",isauth,addComment)
postroutes.get("/:id/comment/all",isauth,getCommentsOfPost)
postroutes.delete("/delete/:id",isauth,deletePost)
postroutes.post("/:id/bookmark",isauth,bookmarkPost)

export default postroutes;