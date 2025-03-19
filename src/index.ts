import express, { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
dotenv.config();
import { UserModel, ContentModel, TagsModel, LinkModel } from "./db";
import { authSchema } from "./authValidation";
import { userMiddleware } from "./middleware";
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET as string;

const app = express();
app.use(express.json());
mongoose
  .connect(process.env.MONGO_URI!)
  .catch((err) => console.log("MongoDB connection error :", err));

app.post("/signup", async (req: Request, res: Response) => {
  try {
    const parsedData = authSchema.safeParse(req.body);

    if (!parsedData.success) {
      res.status(411).json({
        message: "Error in inputs",
        error: parsedData.error.issues[0].message,
      });
      return;
    }

    const { username, password } = parsedData.data;

    const user = await UserModel.findOne({ username });
    if (user) {
      res.status(403).json({
        message: "Username already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      username: username,
      password: hashedPassword,
    });

    res.status(200).json({
      message: "Signed up successfully",
    });
  } catch (e) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await UserModel.findOne({ username });

    if (!user) {
      res.status(403).json({
        message: "User doesn't exist",
      });
      return;
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      res.status(403).json({
        message: "Password doesnt match with the username",
      });
      return;
    }
    const token = jwt.sign(
      {
        id: user._id,
      },
      JWT_SECRET
    );
    res.status(200).json({
      token: token,
    });
  } catch (e) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
});

app.post("/content", userMiddleware, async (req: Request, res: Response) => {
  const link = req.body.link;
  const title = req.body.title;

  // @ts-ignore
  const userId = req.userId;
  try {
    await ContentModel.create({
      link: link,
      title: title,
      tags: [],
      userId,
    });

    res.json({
      message: "Content created successfully",
    });
  } catch (e) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.get("/content", userMiddleware, async (req: Request, res: Response) => {
  // @ts-ignore
  const userId = req.userId;
  const content = await ContentModel.find({ userId }).populate(
    "userId",
    "username -_id"
  );

  res.json({
    content,
  });
});

app.delete("/content", userMiddleware, async (req: Request, res: Response) => {
  const id = req.body.id;

  try {
    await ContentModel.deleteMany({
      _id: id,
      // @ts-ignore
      userId: req.userId,
    });

    res.status(200).json({
      message: "Content Deleted",
    });
  } catch (e) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
});

app.post("/brain/share", (req, res) => {});

app.get("/brain/:shareLink", (req, res) => {});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
