const GroupTable=require('../models/groupsTable');

const createGroup=async(req,res)=>{
    try {
        const {name}=req.body;
        const newgroup=await GroupTable.create({
            name,
            admin:req.user.id
        });
        res.status(201).json(newgroup);
    } catch (error) {
        res.status(500).json(error.message);
    }
}

const allGroups=async(req,res)=>{
    try {
        const allgroups=await GroupTable.findAll();
        res.status(200).json(allgroups);
    } catch (error) {
        res.status(500).json(error.message);
    }
}

module.exports={
    createGroup,
    allGroups
}