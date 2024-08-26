import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import watch_router from "./router/route";
dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 8003;

app.use('/watch',watch_router);

app.get("/",(req,res) => {
    return res.status(200).json({
        msg: "Hello"
    })
});

app.listen(PORT,() => {
    console.log(`Server is running on port ${PORT}`);
})