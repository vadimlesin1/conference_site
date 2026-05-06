const Router = require('express');
const router = new Router();
const authorize = require('../middleware/authorize');
const notificationController = require('../controllers/notificationController');

router.get('/', authorize, notificationController.getNotifications);
router.get('/unread-count', authorize, notificationController.getUnreadCount);
router.put('/mark-read', authorize, notificationController.markAllRead);

module.exports = router;
