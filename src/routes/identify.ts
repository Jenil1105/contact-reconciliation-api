import { Router, Request, Response } from "express";
import { reconcileContact } from "../services/services";

const router = Router();

router.post("/lets", async (req: Request, res: Response) => {
    try {
        const { email, phoneNumber } = req.body;
        const result = await reconcileContact(email, phoneNumber);

        return res.json({ contact: result })

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server Error" });
    }
});

export default router;
