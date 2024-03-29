const uuidv4 = require('uuid/v4');
const multer = require("multer"),
        path = require("path");
const engineerModels = require('../models/engineer-model')
const miscHelper = require('./respons')

const conn = require('../config/conn')
// multer
const storage = multer.diskStorage({
    destination: './images/engineer',
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

//init upload multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1 * 1024 * 1024
    },
    // fileFilter: helpers.imageFilter
}).single('showcase')

module.exports = {

    getEngineers:(req, res)=>{
        const page = parseInt(req.query.page) || 1
        const search = req.query.search || ''
        const limit = req.query.limit || 10
        const sort = req.query.sort || 'DESC'
        const sortBy = req.query.sortBy || 'date_updated'
    
        const offset = (page - 1) * limit
    
        let totalDataEngineer = 0,
             totalPage = 0,
             prevPage = 0,
             nextPage = 0
        conn.query('SELECT COUNT(*) as data FROM engineer', (err, res) => {
          if (err) {
            return miscHelper.response(res, 400, true, 'Error', err)
          }
          totalDataEngineer = res[0].data
          totalPage= totalDataEngineer%limit===0?totalDataEngineer/limit:Math.floor((totalDataEngineer/limit)+1)
          prevPage = page === 1 ? 1 : page - 1
          nextPage = page === totalPage ? totalPage : page + 1
        })

    
        engineerModels.getAll(offset, limit, sort, sortBy, search)
          .then(result => {
            res.status(200).json({
              status: 200,
              error: false,
              source: 'api',
              data: result,
              total_data: Math.ceil(totalDataEngineer),
              per_page: limit,
              current_page: page,
              total_page: totalPage,
              nextLink: `http://localhost:3001${req.originalUrl.replace('page=' + page, 'page=' + nextPage)}`,
              prevLink: `http://localhost:3001${req.originalUrl.replace('page=' + page, 'page=' + prevPage)}`,
              message: 'Success getting all data'
             })
          })
          .catch(err => {
            res.status(400).json({
              status: 400,
              error: true,
              message: err
            })
          })
    },

// create Engineer
createEngineer: (req, res) => {
    upload(req, res, (err) => {
        const { name, location, description, skill, date_of_birth, salary, email } = req.body;
        const id = uuidv4(); // generate new id
        const showcase = req.file.filename;
        const date_created = new Date();
        const date_updated = new Date(); 
        const data = {id, name, description, skill, location,  date_of_birth, showcase, salary, email, date_created, date_updated };
        console.log(data);
        engineerModels.createEngineer(data)
            .then(result => {
                    res.status(201).json({
                    status: 201,
                    err: false,
                    message: 'Success add new Engineer'
                    })
                })
            .catch(err => {
                res.status(400).json({
                    status: 400,
                    err: true,
                    message: err
                    })   
                })
            })
        },

// update engineer
updateEngineer: (req, res) => {
    upload(req, res, (err) => {
        const { name, description, skill, location, date_of_birth, salary, email} = req.body;
        const date_updated = new Date();
        const id = req.params.id;
        const showcase = req.file.filename;
        const data = {id, name, description, skill, location, date_of_birth, salary, showcase, email, date_updated };

        engineerModels.updateEngineer(id, data)
        .then(result => {
            res.status(201).json({
                status: 201,
                err: false,
                data,
                message: 'Success Updated user'
            })
        })
        .catch(err => {
            res.status(400).json({
                status: 400,
                err: true,
                message: err
            })   
        })
    })
},

// delete engineer
deleteEngineer: (req, res) => {
    const id = req.params.id;
    engineerModels.deleteEngineer(id)
    .then(result => {
        res.status(201).json({
        status: 201,
        err: false,
        message: "Engineer have been deleted" 
        })
    })
    .catch(err => {
        res.status(400).json({
        status: 400,
        err: true,
        message: err
        })
    })
}
}