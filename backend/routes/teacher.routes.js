const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Teacher = require("../models/teacher.model");

const router = new express.Router();

// Create new teacher
router.post("/teachers", async (req, res) => {
    const teacher = new Teacher(req.body);

    try {
        await teacher.save();
        res.send({data: teacher, success: true});
    } catch (error) {
        console.log(error)
        if(error.code === 11000) {
            return res.send({success: false, reason: "Email already exists"});
        }
        return res.status(400).send(error);
    }
})

// Login teacher
router.post("/teachers/login", async (req, res) => {
    try {
        const teacher = await Teacher.findOne({email : req.body.email});
        if (!teacher) {
            return res.send({success: false, reason: "User not found"});
        }
        const isMatch = await bcrypt.compare(req.body.password, teacher.password);
        const token = jwt.sign({_id: teacher._id}, process.env.JWT_KEY);
        if(isMatch) {
            return res.send({success: true, data: teacher, token})
        } else {
            return res.send({success: false, reason: "Invalid password"})
        }
    } catch(error) {
        console.log(error);
        return res.status(400).send({success: false, error});
    }
})

// Get an array of all teachers
router.get("/teachers", async (req, res) => {

    try {
        const teachers = await Teacher.find({});
        res.send({success: true, data: teachers});
    } catch (error) {
        res.status(400).send({success: false, error});
    }
})

// Fetch teacher by ID
router.get("/teacher/:id", async (req, res) => {
    const _id = req.params.id;

    try {
        const teacher = await Teacher.findById(_id);
        if(!teacher)
            return res.status(404).send("Teacher not found");
        
        res.send({success: true, data: teacher});
    } catch(error) {
        res.status(500).send({success: false, error});
    }
})

// Update teacher name
router.post("/update/teacher", async (req, res) => {
    try {
        const teacher = await Teacher.findOneAndUpdate({email: req.body.email}, {
            fName: req.body.fName,
            lName: req.body.lName
        }, {new: true, runValidators: true});
        res.send({data: teacher, success: true});
    } catch (error) {
        console.log(error)
        res.status(400).send(error);
    }
})

module.exports = router