const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv')
const router = express.Router();
const User = require('../models/User');


dotenv.config({path: './config/config.env'})
router.post('/createuser', async (req, resp) => {
  const { username, email, password, refferal_code } = req.body

  if (!username || !email || !password) {
    return resp.status(400).json({ message: 'Please fill in all fields properly' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userExists =  await User.findOne({ email });

  if (userExists) {
    return resp.status(400).json({ message: "User already exists" });
  }

  let referral_bonus = 0; 

  const date = new Date();
  const day = date.getDay().toString();
  
  if (refferal_code === "Parent" && day !== 'Saturday' && day !== 'Sunday') {
    referral_bonus = 50;
  }
  
  if (refferal_code === "Parent" && (day === 'Saturday' || day === 'Sunday')) {
    referral_bonus = 100;
  }


  const user = new User({ username, email, password: hashedPassword, referral_bonus });

  await user.save();

  return resp.status(200).json({ message: user });
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