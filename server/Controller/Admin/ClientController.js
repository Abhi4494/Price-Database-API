const db = require("../../models");
const { Sequelize, SuperAdmin,Client,MaterialPrice,Material } = db;
const Op = Sequelize.Op;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require('uuid');
const { generateSecretKey } = require('../../utils/generateSecretKey');
const {getPagination} = require('../../utils/paginate');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const BATCH_SIZE = 500;
const csv = require("csv-parser");
const stripBomStream = require('strip-bom-stream');
// Multer setup
const masterstorage = multer.diskStorage({
  destination(req, file, cb) {
    const filesDir = path.join('public/uploaded-files/');
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir);
    }
    cb(null, filesDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
  }
});

const masterCsvUpload = multer({ storage: masterstorage }).fields([
  { name: "csvFile", maxCount: 1 },
]);


const getAllClients = async (req, res) => {
  try {
    const client_list = await Client.findAll({order: [['id', 'DESC']]});
    return res.status(200).send({
      statusCode: 200,
      message: "Clint list fatched successfully",
      length: client_list.length,
      data: client_list,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      message: error.message,
    });
  }
};


const createClient = async (req, res) => {
   try 
   {
         const { name,email } = req.body;
         const adminID = req.user.id;
         if (!name) {
           return res.status(400).send({
             statusCode: 400,
             message: "Please provide client name",
           });
         }

         if( !email) {
           return res.status(400).send({
             statusCode: 400,
             message: "Please provide client email",
           });
         }

         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
         if (!emailRegex.test(email)) {
           
           return res
             .status(400)
             .send({ statusCode: 400, message: "Invalid email format" });
         }

         const existingUser = await Client.findOne({ where: { email } });
         if (existingUser) {
           return res
             .status(400)
             .send({ statusCode: 400, message: "Email already exists" });
         }

         const newId = uuidv4();
         const secret_key = await generateSecretKey();
         const insertData = {
          client_unique_id: newId,
          name: name,
          email: email,
          admin_id: adminID,
          apiKey: secret_key,
          created_date: new Date()
        };
        const createdClient = await Client.create(insertData);
        return res.status(201).send({
          statusCode: 201,
          message: "Client created successfully",
          data: createdClient,
        });


    
   } catch (error) {
       return res.status(500).send({
         statusCode: 500,
         message: error.message,
       });
   }
}


const importMaterialPrice = async (req, res) => {
  try {
    masterCsvUpload(req, res, async function (err) {
      if (err) return res.status(500).send({ statusCode: 500, message: err.message });

      const file = req.files?.csvFile?.[0];
      const clientId = req.body.client_id;

      if (!file || !clientId) {
        return res.status(400).send({
          statusCode: 400,
          message: "CSV file and client ID are required.",
        });
      }

      const company = await Client.findByPk(clientId);
      if (!company) {
        return res.status(404).send({ statusCode: 404, message: "Client Details not found." });
      }

      const filePath = file.path;
      const rows = [];

      fs.createReadStream(filePath, { encoding: "utf8" })
        .pipe(
          csv({
            mapHeaders: ({ header }) => header.trim().replace(/^\uFEFF/, ""), // normalize headers
          })
        )
        .on("data", (row) => {
          const normalize = (text) => text?.normalize("NFC") || "";

          const {
            SeriesName,
            Region,
            IncoTerm,
            UnitofMeasurement,
            Date,
            Price,
          } = row;

          

          if (SeriesName && Region && IncoTerm && UnitofMeasurement && Date && Price) 
        {
            rows.push({
              SeriesName: SeriesName ? normalize(SeriesName) : null,
              Region: Region ? normalize(Region) : null,
              IncoTerm: IncoTerm? normalize(IncoTerm): null,
              UnitofMeasurement: UnitofMeasurement? normalize(UnitofMeasurement): null,
              Date: Date ? normalize(Date): null,
              price: parseFloat(Price || 0),
            });
          }
        })
        .on("end", async () => {
          const inserted = [];
          const updated = [];
          const skipped = [];

          for (let i = 0; i < rows.length; i += BATCH_SIZE) {
            const batch = rows.slice(i, i + BATCH_SIZE);
            await processMaterialPrice(batch, clientId, req.user.id, inserted, updated, skipped);
          }

          fs.unlinkSync(filePath);

          return res.status(200).send({
            statusCode: 200,
            message: "Export Duty data processed successfully.",
            inserted,
            updated,
            skipped,
          });
        });
    });
  } catch (error) {
    console.error("Export Duty import error:", error);
    return res.status(500).send({ statusCode: 500, message: error.message });
  }
};

const processMaterialPrice = async (batch, clientId, adminId, inserted, updated, skipped) => {
  try {
    const rowsToUpsert = [];

    for (const row of batch) {
      // Split currency and unit
      const { unit_of_measurement, currency, measurment_type } = parseUnitCurrency(row.UnitofMeasurement);

      // Convert Excel month-year to DATE
      // console.log(row.Date,'AAA');
      const price_date = row.Date ? convertMonthYear(row.Date) : null;

      // Step 1: find or create Material
      const [material] = await Material.findOrCreate({
        where: {
          client_id: clientId,
          series_name: row.SeriesName
        },
      });

      // Check if the record already exists
      const existing = await MaterialPrice.findOne({
        where: {
          client_id: clientId,
          material_id: material.id,
          region: row.Region,
          inco_term: row.IncoTerm,
          unit_of_measurement,
          currency,
          price_date,
        },
      });

      const recordData = {
        client_id: clientId,
        material_id: material.id,
        region: row.Region || null,
        inco_term: row.IncoTerm || null,
        unit_of_measurement, // full value USD/MT
        currency, // USD
        measurment_type, // MT
        price_date: convertMonthYear(row.Date),
        price_origin_value: row.Date || null,
        price: row.price || null,
        admin_id: adminId,
      };

      if (existing) {
        // Update
        await existing.update(recordData);
        updated.push(`${row.SeriesName} → ${row.Region} (${row.Date}) updated`);
      } else {
        // Insert
        rowsToUpsert.push(recordData);
        inserted.push(`${row.SeriesName} → ${row.Region} (${row.Date}) inserted`);
      }
    }

    // Bulk insert new rows
    if (rowsToUpsert.length > 0) {
      await MaterialPrice.bulkCreate(rowsToUpsert);
    }
  } catch (err) {
    console.error("Batch processing error:", err);
    skipped.push(`Batch failed: ${err.message}`);
  }
};


// Helper to convert 'Jan-21' → 'YYYY-MM-DD'
const monthMap = {
  Jan: "01",
  Feb: "02",
  Mar: "03",
  Apr: "04",
  May: "05",
  Jun: "06",
  Jul: "07",
  Aug: "08",
  Sep: "09",
  Oct: "10",
  Nov: "11",
  Dec: "12",
};

function convertMonthYear(value) {
  if (!value) return null;

  // If already full date YYYY-MM-DD, return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  // Convert Month-Year format
  const [monthStr, yearStr] = value.split("-");
  const month = monthMap[monthStr];
  const year = yearStr.length === 2 ? "20" + yearStr : yearStr;

  if (!month || !year) return null;

  return `${year}-${month}-01`; // always first day of month
}

// Helper to split 'USD/MT' → currency & unit_of_measurement
const parseUnitCurrency = (value) => {
  if (!value) return { unit_of_measurement: null, currency: null, measurment_type: null };
  const parts = value.split("/");
  return {
    unit_of_measurement: value,          // full string, e.g., "USD/MT"
    currency: parts[0] || null,          // USD
    measurment_type: parts[1] || null,   // MT
  };
};

const isValidDate = (dateStr) => /^\d{4}-\d{2}-\d{2}$/.test(dateStr);
// All Material Price related functions
const getAllMaterialsOLD = async (req, res) => {
  try {
    const clientId = req.client.id;
    const { region, series, from_date, to_date,search  } = req.query;
    const { page, limit, offset } = getPagination(req);
    const whereCondition = { client_id: clientId };
    if(region) whereCondition.region = region;
    if(series) whereCondition.series_name = series;
    if (from_date && to_date) {
      if (!isValidDate(from_date) || !isValidDate(to_date)) {
        return res.status(400).send({
          statusCode: 400,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }
      // ✅ Check if from_date is after to_date
      if (new Date(from_date) > new Date(to_date)) {
        return res.status(400).send({
          statusCode: 400,
          message: "from_date cannot be later than to_date",
        });
      }
      whereCondition.price_date = { [Op.between]: [from_date, to_date] };
    }

    if (search) {
      whereCondition[Op.or] = [
        { series_name: { [Op.like]: `%${search}%` } },
        { region: { [Op.like]: `%${search}%` } },
        { inco_term: { [Op.like]: `%${search}%` } },
        { unit_of_measurement: { [Op.like]: `%${search}%` } },
        { currency: { [Op.like]: `%${search}%` } },
        { measurment_type: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await MaterialPrice.findAndCountAll({
      // attributes: { exclude: ['client_id','createdAt', 'updatedAt','price_date','admin_id'] },
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: [['price_date', 'DESC']],
    });

    const newFromat = rows.map(item => {
      return {
        id: item.id, 
        series_name: item.series_name,
        region: item.region,
        inco_term: item.inco_term,
        unit_of_measurement: item.unit_of_measurement,
        currency: item.currency,
        measurment_type: item.measurment_type,
        date: item.price_origin_value,
        price: item.price,
      };
    });   


    return res.status(200).send({
      statusCode: 200,
      message: "Material Price list fetched successfully",
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: newFromat,
    });  

  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      message: error.message,
    });
  }
};

const getAllMaterials = async (req, res) => {
  try {
    const clientId = req.client.id;
    const { series, search  } = req.query;
    const { page, limit, offset } = getPagination(req);
    const whereCondition = { client_id: clientId };
    
    if(series) whereCondition.series_name = series;
    

    if (search) {
      whereCondition[Op.or] = [
        { series_name: { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows } = await Material.findAndCountAll({
      // attributes: { exclude: ['client_id','createdAt', 'updatedAt','price_date','admin_id'] },
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: [['id', 'DESC']],
    });

    const newFromat = rows.map(item => {
      return {
        id: item.id, 
        series_name: item.series_name,
        
      };
    });   


    return res.status(200).send({
      statusCode: 200,
      message: "Material list fetched successfully",
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: newFromat,
    });  

  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      message: error.message,
    });
  }
};

const getMaterialById = async (req, res) => {
  try {
    const clientId = req.client.id;  // from apiKeyAuth middleware
    const { id } = req.params;
    const { region,from_date, to_date,search,sort_by,order  } = req.query;
    const { page, limit, offset } = getPagination(req);

    const material = await Material.findOne({
      attributes:['id','series_name'],
      where: { id, client_id: clientId },
    });

    if (!material) {
      return res.status(404).send({
        statusCode: 404,
        message: "Material not found",
      });
    }

    
    const whereCondition = { client_id: clientId,material_id:material.id };
    if(region) whereCondition.region = region;
   
    if (from_date && to_date) {
      if (!isValidDate(from_date) || !isValidDate(to_date)) {
        return res.status(400).send({
          statusCode: 400,
          message: "Invalid date format. Use YYYY-MM-DD",
        });
      }
      // ✅ Check if from_date is after to_date
      if (new Date(from_date) > new Date(to_date)) {
        return res.status(400).send({
          statusCode: 400,
          message: "from_date cannot be later than to_date",
        });
      }
      whereCondition.price_date = { [Op.between]: [from_date, to_date] };
    }

    if (search) {
      whereCondition[Op.or] = [
        
        { region: { [Op.like]: `%${search}%` } },
        { inco_term: { [Op.like]: `%${search}%` } },
        { unit_of_measurement: { [Op.like]: `%${search}%` } },
        { currency: { [Op.like]: `%${search}%` } },
        { measurment_type: { [Op.like]: `%${search}%` } },
      ];
    }

    // ✅ Set ordering based on user input
    // Default: sort by price_date DESC
    const allowedSortFields = ['price_date', 'price', 'region', 'inco_term'];
    const sortField = allowedSortFields.includes(sort_by) ? sort_by : 'price_date';
    const sortOrder = order && ['ASC', 'DESC'].includes(order.toUpperCase()) ? order.toUpperCase() : 'DESC';

    const { count, rows } = await MaterialPrice.findAndCountAll({
      // attributes: { exclude: ['client_id','createdAt', 'updatedAt','price_date','admin_id'] },
      where: whereCondition,
      limit: limit,
      offset: offset,
      order: [[sortField, sortOrder]],
    });

    const newFromat = rows.map(item => {
      return {
        id: item.id, 
        material_id: item.material_id,
        region: item.region,
        inco_term: item.inco_term,
        unit_of_measurement: item.unit_of_measurement,
        currency: item.currency,
        measurment_type: item.measurment_type,
        date: item.price_origin_value,
        price: item.price,
      };
    }); 

    const response_data = {
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      price_list: newFromat,
    };

    return res.status(200).send({
      statusCode: 200,
      message: "Material Price List fetched successfully",
      material_name:material.series_name,
      material_id:material.id,
      data: response_data,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      message: error.message,
    });
  }
};


const getPriceById = async (req, res) => {
  try {
    const clientId = req.client.id;  // from apiKeyAuth middleware
    const { id } = req.params;
    const whereCondition = { client_id: clientId,id:id };
    const price_data = await MaterialPrice.findOne({
      where: whereCondition,
      include:[
        {
          model:Material,
          as:"material",
          attributes:['series_name']
        }
      ]
    });
    if(!price_data){
        return res.status(404).send({
        statusCode: 404,
        message: "Material Price not found",
      });
    }

    const newFromat = {
        id: price_data.id, 
        material_name:price_data.material.series_name,
        material_id: price_data.material_id,
        region: price_data.region,
        inco_term: price_data.inco_term,
        unit_of_measurement: price_data.unit_of_measurement,
        currency: price_data.currency,
        measurment_type: price_data.measurment_type,
        date: price_data.price_origin_value,
        price: price_data.price,
      };

    return res.status(200).send({
      statusCode: 200,
      message: "Material Price fetched successfully",
      data: newFromat,
    });
  } catch (error) {
    return res.status(500).send({
      statusCode: 500,
      message: error.message,
    });
  }
};


module.exports = {
  getAllClients,createClient,importMaterialPrice,getAllMaterials,getMaterialById,getPriceById
};