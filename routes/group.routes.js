const express = require('express');
const groupController = require('../controllers/group.controllers');
const { addGroupValidation } = require('../validations/group.validation');
const router = express.Router();

router.get('/add-group', addGroupValidation, groupController.getAddGroup);
router.post('/add-group', groupController.postAddGroup);
router.post('/get-group-level', groupController.getGroupForLevel);
router.get('/view-groups/:level', groupController.getManageGroup);
router.get('/edit-group/:groupId', groupController.getEditGroup);
router.post('/edit-group', addGroupValidation, groupController.postEditStudent);
router.post('/delete-group', groupController.deleteGroup);
router.get('/home', groupController.getHome);
router.get('/calendar-groups', groupController.getGroupsForCalendar);
module.exports = router;
