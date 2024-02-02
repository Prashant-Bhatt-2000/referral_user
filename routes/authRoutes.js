const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const router = express.Router();
const User = require('../models/User');


dotenv.config({path: './config/config.env'})
router.post('/register', async (req, res) => {
  try {
    const data = req.body;

    let parentUser = null;
    if (data.parent_user) {
      parentUser = await User.findOne({ referral_code: data.referral_code });
      if (!parentUser) {
        return res.status(400).json({ error: 'Invalid parent referral code' });
      }
    }

    let referral_bonus = 0;
    if (parentUser) {
      const referral_count = parentUser.child_users.length + 1;
      if (referral_count === 1) referral_bonus = 100;
      else if (referral_count === 2) referral_bonus = 50;
      else if (referral_count >= 3) referral_bonus = 10;
    }

    if (parentUser) {
      parentUser.referral_bonus += referral_bonus;
      await parentUser.save();
    }

    const newUser = new User({
      username: data.username,
      email: data.email,
      parent_user: data.parent_user || false,
      child_user: referral_count, 
      password: data.password,
      referral_code: data.referral_code,
      referral_bonus: 0, 
    });

    
    await newUser.save();

    res.status(200).json({ message: newUser });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



router.post('/login', async(req, resp)=>  { 
    const { email , password } = req.body

    if(!email || !password){ 
        return resp.status(400).send({message:'Please provide an email and a password'})
    }

    const user = await User.findOne({email})

    if(!user)
    { 
        return resp.status(400).send({message:"Email or Password is incorrect"})
    }

    const comparePassword = await bcrypt.compare(password, user.password)

    if(!comparePassword)
    {
        return resp.status(400).json({'message': 'Invalid Credentials'}) 
    }


    const payload = { 
        user: { 
            id : user.id
        }
    }

    const token = jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: '2h'})

    resp.cookie('token', token, {
      expires: new Date(Date.now() + 2 * 60 * 60 * 1000), 
      httpOnly: false, 
    });
  

    return resp.status(200).json({ 'message': 'Login Success', 'token': token})
})

router.get('/getuserid/:id', async(req, resp)=> { 
  try {

    const user = await User.findById(req.params.id);

    if(user){ 

      return resp.status(200).json({ message : user})
    }
    else{ 
      return resp.status(400).json({ message : 'user not Found.'})
    }

  } catch (error) {
    return resp.status(500).json({ message: 'Oops, something went wrong' });
  }
})


module.exports = router;