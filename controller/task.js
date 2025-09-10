const TaskInfo=require('../modals/task');
const userInfo=require('../modals/user');
const addTask =async (req,res)=>{
    const {name,category,amount}=req.body;
    try{
    if(!name||!category||!amount){
       return res.send("Fll all the values");
    }
    const newTask=new TaskInfo({name,category,amount});
    await newTask.save();
    const user=await userInfo.findById(req.user._id);
        if (!user) return res.send("User not found");
    user.tasks.push(newTask._id);
    await user.save();
    return res.send("Task created sucessfully");
}
catch(error){
    return res.status(500).send(error.message);
}
}
const showTask=async(req,res)=>{
    const user=await userInfo.findById(req.user._id).populate('tasks');
      if (!user) return res.send("User not found");
        if (!user.tasks || user.tasks.length === 0) {
      return res.send("No tasks found");
    }
    try{
    let totalAmount=0;
   for(let i=0;i<user.tasks.length;i++){
    totalAmount+=user.tasks[i].amount;
   }
    const taskList = user.tasks.map(task => ({
      id:task._id,
      name: task.name,
      category: task.category,
      amount: task.amount,
      date: task.date,
    }));
    return res.json({ taskList, totalAmount });
  }
  catch(error){
    res.json({message:error.message});
  }
}
const edittask = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json({ message: "Expense ID not provided" });
  }

  try {
    const { name, category, amount } = req.body;

    const task = await TaskInfo.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Expense not found" });
    }
    if (name !== undefined) task.name = name;
    if (category !== undefined) task.category = category;
    if (amount !== undefined) task.amount = amount;

    await task.save();
    return res.status(200).json({ message: "Expense updated successfully", task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deletetask = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(404).json({ message: "Expense ID not provided" });
  }

  try {
    const deletedTask = await TaskInfo.findByIdAndDelete(id);
    if (!deletedTask) {
      return res.status(404).json({ message: "Expense not found" });
    }

    // Also remove the task from user's tasks array
    const user = await userInfo.findById(req.user._id);
    if (user) {
      user.tasks = user.tasks.filter(taskId => taskId.toString() !== id);
      await user.save();
    }

    return res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports={addTask,showTask,edittask,deletetask};