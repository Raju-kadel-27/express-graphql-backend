import { Router, Request, Response } from 'express';

const router = Router()

router.get('/verifytoken', (
    req: Request,
    res: Response
) => {
    try {
        console.log("Verifying token");
        res.status(200).json({ message: 'success' })
    } catch (error) {
        console.log({ error })
    }
})

export default router;