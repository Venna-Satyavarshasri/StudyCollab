import express from "express"
import { 
    createGroup, 
    getMyGroups, 
    deleteGroup, 
    getGroupDetails, 
    addMemberToGroup,
    generateInviteToken,
    joinGroupWithToken,
    removeMemberFromGroup
} from "../controllers/groupController.js"
import { protect } from "../middleware/authMiddleware.js"
import validateObjectIds from "../middleware/validateObjectIds.js"

const router = express.Router();

router.route('/').post(protect, createGroup);
router.route('/my-groups').get(protect, getMyGroups);
router.route('/:groupId')
    .get(protect, validateObjectIds('groupId'), getGroupDetails)
    .delete(protect, validateObjectIds('groupId'), deleteGroup);
router.route('/:groupId/members').post(protect, validateObjectIds('groupId'), addMemberToGroup);
router.route('/:groupId/members/:memberId').delete(protect, validateObjectIds('groupId', 'memberId'), removeMemberFromGroup);

router.post('/:groupId/invite', protect, validateObjectIds('groupId'), generateInviteToken);
router.post('/join/:token', protect, joinGroupWithToken);

export default router;
