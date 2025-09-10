const express=require('express');
const {isauthenticated}=require('../middleware/check');
const { addTask, showTask,edittask,deletetask } = require('../controller/task');
const router=express.Router();
router.post("/addtask",isauthenticated,addTask);
router.get("/showtask",isauthenticated,showTask);
router.put("/:id",isauthenticated,edittask);
router.delete("/:id",isauthenticated,deletetask);
module.exports = router;