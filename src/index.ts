import express, { Request, Response } from "express";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import cors from "cors";
dotenv.config();
import { UserModel, ContentModel, TagsModel, LinkModel } from "./db";
import { authSchema } from "./authValidation";
import { userMiddleware } from "./middleware";
import { random } from "./hash";
const PORT = process.env.PORT;
const JWT_SECRET = process.env.JWT_SECRET as string;

const app = express();
app.use(express.json());
app.use(cors());

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

    const { name, username, password } = parsedData.data;

    const user = await UserModel.findOne({ username });
    if (user) {
      res.status(403).json({
        message: "Username already exists",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await UserModel.create({
      name: name,
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
  const { link, title, description, tags } = req.body;

  const userId = req.userId;
  try {
    const tagsId = [];

    if (tags && tags.length > 0) {
      for (const tagTitle of tags) {
        let tag = await TagsModel.findOne({ title: tagTitle });

        if (!tag) {
          tag = await TagsModel.create({ title: tagTitle });
        }
        tagsId.push(tag._id);
      }
    }

    await ContentModel.create({
      link: link,
      title: title,
      description: description,
      tags: tagsId,
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
  const userId = req.userId;
  try {
    const content = await ContentModel.find({ userId })
      .populate("userId", "username name -_id")
      .populate("tags", "title -_id");

    if (content.length > 0) {
      res.json({
        content,
      });
    } else {
      const user = await UserModel.findOne({ _id: userId });
      res.json({
        content: user,
      });
    }
  } catch (e) {
    res.status(500).json({
      message: "Internal server error",
    });
  }
});

app.get("/content/tags", async (req: Request, res: Response) => {
  try {
    const tags = await TagsModel.find({}, "title -_id");
    res.json({
      tags,
    });
  } catch (e) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
});

app.delete("/content", userMiddleware, async (req: Request, res: Response) => {
  const id = req.body.id;

  try {
    await ContentModel.deleteMany({
      _id: id,

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

app.post(
  "/brain/share",
  userMiddleware,
  async (req: Request, res: Response) => {
    const { share } = req.body;
    const userId = req.userId;
    try {
      if (!share) {
        await LinkModel.deleteMany({ userId });

        res.json({
          message: "Link deleted",
        });
        return;
      }

      const isShared = await LinkModel.findOne({
        userId: userId,
      });

      if (isShared) {
        res.json({
          link: `/brain/${isShared.link}`,
        });
        return;
      }
      const hash = random(10);
      const link = await LinkModel.create({
        link: hash,
        userId: userId,
      });

      res.json({
        link: `/brain/${hash}`,
      });
    } catch (e) {
      res.status(500).json({
        message: "Internal server error",
      });
      return;
    }
  }
);

app.get("/brain/:shareLink", async (req: Request, res: Response) => {
  const hash = req.params.shareLink;

  try {
    const link = await LinkModel.findOne({ link: hash });

    if (!link) {
      res.status(404).json({
        message: "Link not found",
      });
      return;
    }

    const content = await ContentModel.find({ userId: link.userId })
      .populate("userId", "name username -_id")
      .populate("tags", "title -_id");

    if (content.length > 0) {
      res.json({
        content,
      });
    } else {
      const user = await UserModel.findOne({ _id: link.userId });
      res.json({
        content: user,
      });
    }
  } catch (e) {
    res.status(500).json({
      message: "Internal server error",
    });
    return;
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
