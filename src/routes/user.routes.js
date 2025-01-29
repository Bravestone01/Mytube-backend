import { Router } from "express";
import { registerUser, loginUser , logoutUser} from "../controllers/user.controller.js";
import  {upload}  from "../middlewares/multer.middleware.js"
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(
    upload.fields([
      { name: "avatar", maxCount: 1 },
      { name: "coverImage", maxCount: 1 },
    ]),
    (err, req, res, next) => {
      if (err) {
        return res.status(400).send(err.message);
      }
      next();
    },
    registerUser
  );
  
 router.route("/login").post(loginUser); 

 // secured routes
 router.route("/logout").post(verifyJWT, logoutUser);

export default router;