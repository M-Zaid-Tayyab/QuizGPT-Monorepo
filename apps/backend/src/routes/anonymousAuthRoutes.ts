import express from 'express';
import {
    createAnonymousUser,
    getAnonymousUserDetails,
    updateAnonymousUser,
} from '../controllers/anonymousAuthController';
import { protectAnonymous } from '../middleware/anonymousAuthMiddleware';

const router = express.Router();

router.post('/register', createAnonymousUser);
router.get('/user', protectAnonymous, getAnonymousUserDetails);
router.put('/user', protectAnonymous, updateAnonymousUser);

export default router; 