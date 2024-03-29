'use strict'

require('dotenv/config')
const uuidv4 = require('uuid/v4')
const model = require('../models/user_model')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

module.exports = {
    registerUser: (req, res) => {
        const id = uuidv4()
        const { email, role } = req.body
        const password = bcrypt.hashSync(req.body.password, 8)
        const data = { id, email, password, role }

        model.register(data)
            .then(result => {
                res.status(200).json({
                    error: false,
                    message: result
                })
            })
            .catch(err => {
                res.status(400).json({
                    error: true,
                    message: err
                })
            })
    },
    loginUser: (req, res) => {
        const email = req.body.email
        const password = req.body.password ? req.body.password : ''
        if (!email) {
            res.json({
                message: 'Email required'
            })
        } else {
            model.login(email)
                .then(result => {
                    // let validPassword = bcrypt.compareSync(password, result[0].password)
                    // if (!validPassword) {
                    //     res.json({
                    //         message: 'Invalid Password, Login Failed!!!'
                    //     })
                    // } else { 
                        
                        jwt.sign({ result }, process.env.SECRET_KEY, { expiresIn: '1d' }, (err, token) => {
                            res.json({
                                message: 'Login Success!',
                                data: result[0],
                                token
                            })
                        })
                    
                })
                .catch(err => {
                    res.json({ err })
                })
        }
    }
}